import { Logger } from "@nestjs/common";
import { glob } from "glob";
import fs from "fs";
import { Mount } from "../entities/mount.entity";
import path from "path";
import { FileDTO } from "../dtos/file.dto";
import { MountScanResultDTO } from "../dtos/scan-result.dto";
import { File } from "../../file/entities/file.entity";
import { WorkerFailedEvent, WorkerJobRef, WorkerProgressEvent } from "@soundcore/nest-queue";

import workerpool from "workerpool";
import Database from "../../utils/database/database-worker-client";
import { FileSystemService } from "../../filesystem/services/filesystem.service";

const logger = new Logger("MountWorker");

export const MOUNT_STEP_MKDIR = "CREATE_DIRECTORY";
export const MOUNT_STEP_PREPARE = "PREPARING_SCAN";
export const MOUNT_STEP_SCAN = "SCANNING";

export default async function (job: WorkerJobRef<Mount>): Promise<MountScanResultDTO> {
    const mount = job.payload;

    if(typeof mount === "undefined" || mount == null) {
        throw new Error("Invalid mount: null");
    }

    return Database.connect().then((dataSource) => {
        const repository = dataSource.getRepository(File);
        const fileSystem = new FileSystemService();

        return repository.find({ where: { mount: { id: mount.id }, }, select: ["name", "directory"]}).then((existingFiles) => {
            const mountDirectory = fileSystem.resolveMountPath(mount);

            // Create directory if it does not exist.
            if(!fs.existsSync(mountDirectory)) {
                logger.warn(`Could not find directory '${mountDirectory}'. Creating it...`);
                fs.mkdirSync(mountDirectory, { recursive: true });
                logger.verbose(`Created directory '${mountDirectory}'.`);
            }
    
            // Execute scan
            return scanMount(job, existingFiles);
        });
    });
}

/**
 * Scan the mount's directory for mp3 files.
 * @param pid PID of the process
 * @param job Job data
 * @param exclude Exclude already scanned files.
 * @returns MountScanResultDTO
 */
async function scanMount(job: WorkerJobRef<Mount>, exclude: File[]): Promise<MountScanResultDTO> {
    return new Promise(async (resolve, reject) => {
        // Update progress
        updateProgress(job, 0.66);

        const mount = job.payload;
        const startTime = Date.now();

        // Set an interval that periodically updates the job in queue.
        // This causes the job not be considered stalled.
        const excludeList: string[] = [];

        // If there are files to exclude,
        // build the filter list.
        if(exclude.length > 0) {
            logger.debug(`[${mount.name}] Building exclude list using ${exclude.length} files...`);
            for(let i = 0; i < exclude.length; i++) {
                excludeList.push(path.join(exclude[i].directory, exclude[i].name));
            }
            logger.debug(`[${mount.name}] Building exclude list took ${Date.now()-startTime}ms.`);
        }

        logger.log(`Scanning directory '${mount.directory}' on mount '${mount.name}'. PID: ${process.pid}`);

        // Execute scan
        const files: FileDTO[] = [];
        const globs = glob("**/*.mp3", { ignore: excludeList, cwd: mount.directory }, () => ({}));

        // Listen for match event
        // On every match, create a new object
        // for future processing
        globs.on("match", (match: any) => {
            // On every match, create object.
            const file = new FileDTO();
            file.directory = path.dirname(match);
            file.filename = path.basename(match);
            file.mount = mount;

            files.push(file);
        })

        // Listen for END event.
        // This will be triggered when matching process is done.
        globs.on("end", () => { 
            resolve(new MountScanResultDTO(files, Date.now() - startTime));
        })

        // Listen for error event
        globs.on("error", (err: Error) => {
            reject(err);
        })
    })
}

/**
 * Update job with current progress.
 * @param job Job to update
 * @param progress Progress information
 */
function updateProgress(job: WorkerJobRef, progress: number) {
    job.progress = progress;
    workerpool.workerEmit(new WorkerProgressEvent(job));
}

function reportError(job: WorkerJobRef, error: Error) {
    workerpool.workerEmit(new WorkerFailedEvent(job, error));
}
  