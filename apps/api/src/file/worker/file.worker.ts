import fs from "node:fs";
import crypto from "node:crypto";

import { Logger } from "@nestjs/common";
import { FileProcessDTO, FileProcessFlag } from "../dto/file-process.dto";
import { File, FileFlag, FileID } from "../entities/file.entity";
import { WorkerJobRef, WorkerProgressEvent } from "@soundcore/nest-queue";
import workerpool from "workerpool";
import Database from "../../utils/database/database-worker-client";
import { FileService } from "../services/file.service";
import { FileProcessResultDTO } from "../dto/file-process-result.dto";
import { FileDTO } from "../dto/file.dto";
import { Batch } from "@soundcore/common";
import { DataSource } from "typeorm";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Mount } from "../../mount/entities/mount.entity";
import { MountService } from "../../mount/services/mount.service";
import { MountRegistryService } from "../../mount/services/mount-registry.service";
import { MountScanFlag } from "../../mount/dtos/scan-process.dto";

const logger = new Logger("FileWorker")

// What comes in? FileDTO[]
// What comes out? FileID[]

export default async function (job: WorkerJobRef<FileProcessDTO>): Promise<FileProcessResultDTO[]> {
    return Database.connect().then(async (datasource) => {
        const { mount, flag, scanFlag } = job.payload;
        const startTime = Date.now();
        const fileIds: FileID[] = [];

        if(flag == FileProcessFlag.DEFAULT) {
            // This will create new file entities by given dtos.
            fileIds.push(...await processGivenFiles(job, datasource));
            const timeTookMs = Date.now() - startTime;
            return [new FileProcessResultDTO(mount, fileIds, timeTookMs, flag, scanFlag)];
        } else if(flag == FileProcessFlag.CONTINUE_AWAITING) {
            // This will just fetch all files depending on the awaiting flag.
            // It pushes entities to the result list which then will hand over the data
            // to the next step in the indexation pipeline
            return continueAwaitingFiles(job);
        } else {
            throw new Error(`Received file process task with an invalid process type. Received ${flag}, expected one of [${Object.values(FileProcessFlag)}]`);
        }    
    });
}

async function processGivenFiles(job: WorkerJobRef<FileProcessDTO>, datasource: DataSource): Promise<FileID[]> {
    const { mount, files, scanFlag } = job.payload;

    const fileSystem = new FileSystemService();
    const service = new FileService(datasource.getRepository(File));

    return Batch.of<FileDTO, FileID>(files).do(async (batch, currentBatch, batches) => {
        const createdFiles: File[] = [];
        const collectedFiles: File[] = [];

        for(const dto of batch) {
            const file = new File();
            file.name = dto.filename;
            file.directory = dto.directory;
            file.mount = mount;

            // Resolving absolute filepath
            const filepath = fileSystem.resolveFilepath(file);

            try {
                // Get file stats
                const stats = fs.statSync(filepath, { throwIfNoEntry: true });
                if(!stats) logger.warn(`Could not get file stats for '${filepath}'.`);

                // Set size of the file entity
                file.size = stats?.size || 0;

                // Calculate hash consisting of information
                // that make the file unique
                const pathToHash = `${mount.id}:${file.directory}:${file.name}:${file.size}`;
                // Update hash on file entity
                file.pathHash = crypto.createHash("md5").update(pathToHash, "binary").digest("hex");

                collectedFiles.push(file);
            } catch (error) {
                logger.warn(`Skipping file file ${filepath} because it could not be analyzed: ${error["message"] || error}`);
                continue;
            }
        }

        // Create database entries
        if(scanFlag == MountScanFlag.DEFAULT_SCAN) {
            // This will create files in database but only returns entities that were created
            // via this query and did not exist before
            createdFiles.push(... await service.createFiles(collectedFiles).catch((error: Error) => {
                logger.error(`Error occured whilst processing batch ${currentBatch}: ${error.message}`, error.stack);
                return [];
            }));
        } else if(scanFlag == MountScanFlag.RESCAN) {
            // This will create files in database but returns all files even those that were not created
            // with this query but are included in the list.
            createdFiles.push(... await service.createAndFindAll(collectedFiles).catch((error: Error) => {
                logger.error(`Error occured whilst processing batch ${currentBatch}: ${error.message}`, error.stack);
                return [];
            }));
        } else {
            throw new Error(`Received file process task with invalid flag. Received ${scanFlag}, expected one of [${Object.values(MountScanFlag).join(", ")}]`);
        }

        return createdFiles.map((file) => ({ id: file.id }));
    }).progress((batches, current) => {
        // Update job progress
        job.progress = Math.round((current / batches) * 100);

        // Emit progress update
        workerpool.workerEmit(new WorkerProgressEvent(job));
    }).catch((batchNr, error) => {
        logger.error(`Error occured while handling batch #${batchNr} in file worker: ${error.message}`, error.stack);
    }).start().catch(() => []);
}

/**
 * Worker function that looks for mounts in the database that have files with status of PENDING_ANALYSIS.
 * This usually means, the scanning or indexing process was aborted by either a server crash or an
 * unexpected error.
 * Upon completion, the queue service receives a list of mounts that need to be scanned.
 * @param job Job data
 * @returns List of mounts.
 */
async function continueAwaitingFiles(job: WorkerJobRef<FileProcessDTO>): Promise<FileProcessResultDTO[]> {
    const startedAtMs = Date.now();
    const { flag, scanFlag } = job.payload;

    return Database.connect().then((datasource) => {
        const fsService = new FileSystemService();
        const registryService = new MountRegistryService(fsService);

        const mountRepo = datasource.getRepository(Mount);
        const fileRepo = datasource.getRepository(File);

        const mountService = new MountService(mountRepo, fsService, registryService, null);
        const fileService = new FileService(fileRepo);

        return mountService.findHasAwaitingFiles().then((mounts) => {
            return Batch.of<Mount, FileProcessResultDTO>(mounts, 1).do(async (batch) => {
                // As the batch size is always 1
                const mount = batch[0];
                const files = await fileService.findByFlagAndMount(mount.id, FileFlag.PENDING_ANALYSIS);

                return [ new FileProcessResultDTO(
                    mount, 
                    files.map((file) => ({ id: file.id })), 
                    Date.now() - startedAtMs, 
                    flag,
                    scanFlag
                )];
            }).start().then((values) => {
                return values;
            });
        });
    });
}