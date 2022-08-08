import { Logger } from "@nestjs/common";
import { DoneCallback, Job } from "bull";
import { glob } from "glob";
import fs from "fs";
import { Mount } from "../entities/mount.entity";
import path from "path";
import { FileDTO } from "../dtos/file.dto";
import { MountScanProcessDTO } from "../dtos/mount-scan.dto";
import { MountScanResultDTO } from "../dtos/scan-result.dto";
import { File } from "../../file/entities/file.entity";
import { ProgressInfoDTO } from "./progress-info.dto";
import { DBWorker } from "../../utils/workers/worker.util";

const logger = new Logger("MountWorker");

export const MOUNT_STEP_MKDIR = "CREATE_DIRECTORY";
export const MOUNT_STEP_PREPARE = "PREPARING_SCAN";
export const MOUNT_STEP_SCAN = "SCANNING";

const MAX_STEPS = 3;

export default function (job: Job<MountScanProcessDTO>, dc: DoneCallback) {
    const scan = job.data;
    const mount = scan?.mount;
    const pid = process.pid;    

    try {
        if(!mount) {
            reportError(mount, new Error("Invalid mount: null"), dc);
        } else {
            // Establish database connection
            DBWorker.instance().then((worker) => {
                worker.establishConnection().then((dataSource) => {
                    const repository = dataSource.getRepository(File);
                    const fileSystem = worker.getFileSystem();

                    repository.find({ where: { mount: { id: mount.id }, }, select: ["name", "directory"]}).then((existingFiles) => {
                        updateProgress(job, { currentStep: 1, totalSteps: MAX_STEPS, stepCode: MOUNT_STEP_MKDIR });
                        const mountDirectory = fileSystem.resolveMountPath(mount);

                        // Create directory if it does not exist.
                        if(!fs.existsSync(mountDirectory)) {
                            logger.warn(`Could not find directory '${mountDirectory}'. Creating it...`);
                            fs.mkdirSync(mountDirectory, { recursive: true });
                            logger.verbose(`Created directory '${mountDirectory}'.`);
                        }
    
                        // Execute scan
                        scanMount(pid, job, existingFiles).then((result) => {
                            reportSuccess(result, dc);
                        }).catch((error) => {
                            reportError(mount, error, dc);
                        })
                    }).catch((error) => {
                        reportError(mount, error, dc);
                    })
                }).catch((error) => {
                    reportError(mount, error, dc);
                })
            });
        }
    } catch(err: any) {
        reportError(mount, err, dc);
    }
}

/**
 * Scan the mount's directory for mp3 files.
 * @param pid PID of the process
 * @param job Job data
 * @param exclude Exclude already scanned files.
 * @returns MountScanResultDTO
 */
function scanMount(pid: number, job: Job<MountScanProcessDTO>, exclude: File[]): Promise<MountScanResultDTO> {
    return new Promise(async (resolve, reject) => {
        // Update progress
        await updateProgress(job, { currentStep: 2, totalSteps: MAX_STEPS, stepCode: MOUNT_STEP_PREPARE });

        const mount = job.data.mount;
        const startTime = Date.now();

        // Set an interval that periodically updates the job in queue.
        // This causes the job not be considered stalled.
        let interval = setInterval(() => preventStall(job), 2000);
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
        clearInterval(interval)

        logger.log(`Scanning directory '${mount.directory}' on mount '${mount.name}'. PID: ${pid}`);

        // Execute scan
        const files: FileDTO[] = [];
        interval = setInterval(() => updateProgress(job, { currentStep: 3, totalSteps: MAX_STEPS, stepCode: MOUNT_STEP_SCAN }), 2000);
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
            clearInterval(interval);                   
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
async function updateProgress(job: Job<MountScanProcessDTO>, progress: ProgressInfoDTO) {
    const data = job.data;
    data.progress = progress;
    return job.progress(data);
}

/**
 * This will send an update to the queue.
 * Bull will receive the update and will not consider
 * the job stalled.
 * @param job Job to prevent stalling
 * @param progress Optional progress information
 */
async function preventStall(job: Job<MountScanProcessDTO>, progress?: ProgressInfoDTO) {
    if(progress) return updateProgress(job, progress);
    return job.update(job.data);
}

function reportSuccess(result: MountScanResultDTO, dc: DoneCallback) {
    // logger.log(`Scanned mount '${job.data.mount.name}'. Found ${result.report.totalFiles} files in total. ${result.report.newFiles} Files need to be processed. Took ${Date.now()-startTime}ms`);
    dc(null, result);
}

function reportError(context: Mount, error: Error, dc: DoneCallback) {
    logger.error(`Failed scanning mount '${context.name}': ${error.message}`, error.stack);
    dc(error, []);
}
  