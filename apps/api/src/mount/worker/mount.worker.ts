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
import Debug from "../../utils/debug";

const logger = new Logger("MountWorker");

export const MOUNT_STEP_MKDIR = "CREATE_DIRECTORY";
export const MOUNT_STEP_PREPARE = "PREPARING_SCAN";
export const MOUNT_STEP_SCAN = "SCANNING";

class Registry {
    constructor(
        public files: string[] = []
    ) {}
}

/**
 * Algorithm Overview
 * 
 * 1. Create mount directory if not exists
 * 2. Search files recursively using glob
 * 3. 
 */

export default async function (job: WorkerJobRef<Mount>): Promise<MountScanResultDTO> {
    const mount = job.payload;

    if(typeof mount === "undefined" || mount == null) {
        throw new Error("Invalid mount: null");
    }

    const fileSystem = new FileSystemService();
    const mountDirectory = fileSystem.resolveMountPath(mount);

    // Create directory if it does not exist.
    if(!fs.existsSync(mountDirectory)) {
        logger.warn(`Could not find directory '${mountDirectory}'. Creating it...`);
        fs.mkdirSync(mountDirectory, { recursive: true });
    }

    // Execute scan
    return scanMount(job);
}

/**
 * Scan the mount's directory for mp3 files.
 * @param pid PID of the process
 * @param job Job data
 * @param exclude Exclude already scanned files.
 * @returns MountScanResultDTO
 */
async function scanMount(job: WorkerJobRef<Mount>): Promise<MountScanResultDTO> {
    return new Promise(async (resolve, reject) => {
        // Update progress
        updateProgress(job, 0.33);

        // Prepare variables
        const mount = job.payload;
        const directory = path.resolve(mount.directory);
        const startTime = Date.now();

        // Read registry
        const registry: Registry = await readFileRegistry(directory);

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
            saveFileRegistry(directory, registry).finally(() => {
                resolve(new MountScanResultDTO(files, matches.length, Date.now() - startTime));
            });
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

function getRegistryFilepath(cwd: string): string {
    return path.resolve(path.join(cwd, ".registry"));
}

async function readFileRegistry(cwd: string) {
    return new Promise<Registry>(async (resolve, reject) => {
        const registryFilepath: string = getRegistryFilepath(cwd);

        if(Debug.isDebug) {
            logger.debug(`Reading registry file ${registryFilepath}`);
        }

        if(!fs.existsSync(registryFilepath)) {
            saveFileRegistry(cwd, new Registry()).then((registry) => resolve(registry)).catch((error) => reject(error));
            return;
        }

        const buffer = fs.readFileSync(registryFilepath);
        const registry: Registry = Object.assign(new Registry(), JSON.parse(buffer.toString()));
        resolve(registry);
    }).catch((error: Error) => {
        logger.warn(`Could not read registry for mount. This means looking up files cannot be optimized: ${error.message}`);
        return new Registry();
    })
}
  
async function saveFileRegistry(cwd: string, registry: Registry): Promise<Registry> {
    const registryFilepath: string = getRegistryFilepath(cwd);

    return new Promise<Registry>((resolve, reject) => {
        if(Debug.isDebug) {
            logger.debug(`Saving registry file ${registryFilepath}...`);
        }

        fs.writeFile(registryFilepath, JSON.stringify(registry), (err) => {
            if(err) reject(err);
            resolve(registry);
        })
    }).catch((error: Error) => {
        logger.warn(`Could not write file registry. This is not an error but informs about a failed optimisation attempt when looking up files: ${error.message}`);
        throw error;
    });
}
