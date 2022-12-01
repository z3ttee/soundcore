import { Logger } from "@nestjs/common";
import { glob } from "glob";
import fs from "fs";
import { Mount } from "../entities/mount.entity";
import path from "path";
import { FileDTO } from "../dtos/file.dto";
import { MountScanResultDTO } from "../dtos/scan-result.dto";
import { WorkerJobRef, WorkerProgressEvent } from "@soundcore/nest-queue";

import workerpool from "workerpool";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { MountRegistryService } from "../services/mount-registry.service";
import { MountRegistry } from "../entities/mount-registry.entity";
import { MountScanFlag, MountScanProcessDTO } from "../dtos/scan-process.dto";

const logger = new Logger("MountWorker");
const filesystem = new FileSystemService();
const registryService = new MountRegistryService(filesystem);

export const MOUNT_STEP_MKDIR = "CREATE_DIRECTORY";
export const MOUNT_STEP_PREPARE = "PREPARING_SCAN";
export const MOUNT_STEP_SCAN = "SCANNING";

/**
 * Algorithm Overview
 * 
 * 1. Create mount directory if not exists
 * 2. Search files recursively using glob
 * 3. 
 */

export default async function (job: WorkerJobRef<MountScanProcessDTO>): Promise<MountScanResultDTO> {
    const { mount, flag } = job.payload;

    if(typeof mount === "undefined" || mount == null) {
        throw new Error("Invalid mount: null");
    }

    const mountDirectory = filesystem.resolveMountPath(mount);

    // Create directory if it does not exist.
    if(!fs.existsSync(mountDirectory)) {
        logger.warn(`Could not find directory '${mountDirectory}'. Creating it...`);
        fs.mkdirSync(mountDirectory, { recursive: true });
    }

    // Execute correct type of scan
    if(flag === MountScanFlag.DEFAULT_SCAN) {
        return scanMount(job);
    } else if(flag === MountScanFlag.RESCAN) {
        return rescanMount(job);
    }
}

/**
 * Scan the mount's directory for mp3 files.
 * @param pid PID of the process
 * @param job Job data
 * @param exclude Exclude already scanned files.
 * @returns MountScanResultDTO
 */
async function scanMount(job: WorkerJobRef<MountScanProcessDTO>): Promise<MountScanResultDTO> {
    return new Promise(async (resolve, reject) => {
        // Update progress
        updateProgress(job, 0.33);

        // Prepare variables
        const { mount } = job.payload;
        const directory = path.resolve(mount.directory);
        const startTime = Date.now();

        // Read registry
        const registry: MountRegistry = await registryService.readRegistry(mount);

        // Execute scan
        const files: FileDTO[] = [];
        const matches: string[] = [];
        const globs = glob("**/*.mp3", { cwd: directory }, () => ({}));

        // Listen for match event
        // On every match, create a new object
        // for future processing
        globs.on("match", (match: any) => {
            // Check if files already in registry, if not, add to files list
            // for further processing. Otherwise it will be ignored
            if(!registry.files.includes(match)) {
                // On every match, create object.
                const file = new FileDTO();
                file.directory = path.dirname(match);
                file.filename = path.basename(match);

                files.push(file);
            }
            
            // Always add match to matches array
            matches.push(match);
        })

        // Listen for END event.
        // This will be triggered when matching process is done.
        globs.on("end", () => { 
            updateProgress(job, 0.9);

            // Update registry file entries
            registry.files = matches;
            registryService.saveRegistry(registry).finally(() => {
                resolve(new MountScanResultDTO(files, matches.length, Date.now() - startTime));
            });
        })

        // Listen for error event
        globs.on("error", (err: Error) => {
            reject(err);
        })
    })
}

async function rescanMount(job: WorkerJobRef<MountScanProcessDTO>): Promise<MountScanResultDTO> {
    const fsService = new FileSystemService();
    const registryService = new MountRegistryService(fsService);

    const { mount } = job.payload;
    return registryService.resetRegistryOf(mount).then((registry) => {
        logger.verbose(`Registry of mount '${mount.name}' has been reset.`);
        return scanMount(job).then((result) => {
            // Transform result so the RESCAN flag is carried on to the next process.
            return {
                ...result,
                flag: MountScanFlag.RESCAN
            };
        });
    });
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
  