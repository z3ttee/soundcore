import fs from "node:fs";
import crypto from "node:crypto";

import { Logger } from "@nestjs/common";
import { FileProcessDTO, FileProcessType } from "../dto/file-process.dto";
import { File, FileFlag } from "../entities/file.entity";
import { WorkerJobRef, WorkerProgressEvent } from "@soundcore/nest-queue";
import workerpool from "workerpool";
import Database from "../../utils/database/database-worker-client";
import { FileService } from "../services/file.service";
import { FileProcessResultDTO } from "../dto/file-process-result.dto";
import { FileDTO } from "../../mount/dtos/file.dto";
import { Batch } from "@soundcore/common";
import { DataSource } from "typeorm";
import { FileSystemService } from "../../filesystem/services/filesystem.service";

const logger = new Logger("FileWorker")

export default async function (job: WorkerJobRef<FileProcessDTO>): Promise<FileProcessResultDTO> {
    return Database.connect().then(async (datasource) => {
        
        const { mount, type } = job.payload;
        const startTime = Date.now();
        const results: File[] = [];

        if(type == FileProcessType.DEFAULT) {
            // This will create new file entities by given dtos.
            results.push(...await processGivenFiles(job, datasource));
        } else if(type == FileProcessType.FLAG_BASED) {
            // This will just fetch all files depending on the awaiting flag.
            // It pushes entities to the result list which then will hand over the data
            // to the next step in the indexation pipeline
            results.push(...await processByAwaitingFlag(job, datasource))
        } else {
            logger.warn(`Received file process task with an invalid process type. Received ${type}, expected one of [${Object.values(FileProcessType)}]`);
        }
    
        const timeTookMs = Date.now() - startTime;
        return new FileProcessResultDTO(mount, results, timeTookMs);
    });
}

async function processGivenFiles(job: WorkerJobRef<FileProcessDTO>, datasource: DataSource) {
    const { mount, files } = job.payload;

    const fileSystem = new FileSystemService();
    const service = new FileService(datasource.getRepository(File));

    return Batch.of<FileDTO, File>(files).do(async (batch, currentBatch, batches) => {
        const results: File[] = [];
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
        results.push(... await service.createFiles(collectedFiles).catch((error: Error) => {
            logger.error(`Error occured whilst processing batch ${currentBatch}: ${error.message}`, error.stack);
            return [];
        }));

        return results;
    }).progress((batches, current) => {
        // Update job progress
        job.progress = Math.round((current / batches) * 100);

        // Emit progress update
        workerpool.workerEmit(new WorkerProgressEvent(job));
    }).catch((batchNr, error) => {
        logger.error(`Error occured while handling batch #${batchNr} in file worker: ${error.message}`, error.stack);
    }).start().catch(() => []);
}

async function processByAwaitingFlag(job: WorkerJobRef<FileProcessDTO>, datasource: DataSource) {
    const service = new FileService(datasource.getRepository(File)); 

    const files: File[] = await service.findByFlag(FileFlag.PENDING_ANALYSIS).catch((error: Error) => {
        logger.error(`Could not fetch files to process files by flag: ${error.message}`);
        return [];
    });

    return files;
}