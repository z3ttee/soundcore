import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_FILES_FOUND, MOUNT_MAX_STEPS, MOUNT_STEP_WAITING } from "../../constants";
import { FilesFoundEvent } from "../../events/files-found.event";
import { MountScanResultDTO } from "../dtos/scan-result.dto";
import { MountService } from "./mount.service";
import { AdminGateway } from "../../gateway/gateways/admin-gateway.gateway";
import { Environment } from "@soundcore/common";
import { MountScanFlag, MountScanProcessDTO } from "../dtos/scan-process.dto";
import { MountProgressInfo, MountStatus } from "../entities/mount.entity";

const CURRENT_STEP = 1;
const STEP_INFO: MountProgressInfo = {
    title: "Scanning files",
    description: "Looking up all files that are located in the mount's directory on disk."
}
@Injectable()
export class MountQueueService {
    private logger = new Logger(MountQueueService.name);

    constructor(
        private readonly mountService: MountService,
        private readonly adminGateway: AdminGateway,
        private readonly events: EventEmitter2,
        private readonly queue: WorkerQueue<MountScanProcessDTO>
    ) {
        this.queue.on("completed", (job) => this.handleOnCompleted(job));
        this.queue.on("failed", (job, error) => this.handleOnFailed(job, error));

        this.queue.on("waiting", async () => {
            if(Environment.isDebug) {
                this.logger.debug(`Received jobs concerning scanning for new files. Distributing among workers...`);
            }
        });

        this.queue.on("drained", async () => {
            if(Environment.isDebug) {
                this.logger.debug(`All jobs concerning scanning for new files have been distributed to workers. Waiting for new jobs...`);
            }
        });

        this.queue.on("started", async (job: WorkerJob<MountScanProcessDTO>) => {
            const { payload } = job;
            const { mount, flag } = payload;

            if(flag !== MountScanFlag.DOCKER_LOOKUP) {
                if(Environment.isDebug) {
                    this.logger.verbose(`Looking for files on mount '${mount.name}'...`);
                }

                // Send progress update
                this.mountService.setProgressInfoAndEmit(mount, {
                    mountId: mount.id,
                    maxSteps: MOUNT_MAX_STEPS,
                    currentStep: 1,
                    info: STEP_INFO,
                    progress: -1
                });
            }
        });


        // Progress
        this.queue.on("progress", async (job: WorkerJobRef<MountScanProcessDTO>) => {
            const { mount, flag } = job.payload;

            // Unavailable if in docker lookup mode
            if(flag === MountScanFlag.DOCKER_LOOKUP) return;

            if(Environment.isDebug) {
                this.logger.debug(`Received progress update from mount ${mount.name}: ${job.progress}`);
            }
        });        
    }

    /**
     * Queue event handler that handles completion events
     * @param job Job data
     */
    private async handleOnCompleted(job: WorkerJob<MountScanProcessDTO, MountScanResultDTO>) {
        const { payload, result } = job;
        const { flag } = payload;

        // If the job has the flag DOCKER_LOOKUP, that means
        // the only objective was to create mounts based on mounted directories.
        // This will only happen, if the application is in DOCKER mode.
        // The job has completed and the default scanning process is triggered here.
        if(job.payload.flag === MountScanFlag.DOCKER_LOOKUP) {
            this.mountService.checkMountsStandaloneMode();
            return;
        }

        const files = result?.files || [];
        const mount = result.mount;

        // Update last scanned at
        await this.mountService.updateLastScanned(mount);
        

        if(files.length <= 0) {
            this.logger.verbose(`No new files found (total: ${result?.totalFiles}) on mount '${mount.name}'. Took ${result?.timeMs}ms.`);
            // Do not emit event if the flag is not set to rescan
            if(flag != MountScanFlag.RESCAN) {
                // This is no rescan, so no files means no further steps needed
                // Status can be cleared and set to UP
                await this.mountService.setProgressInfoAndEmit(mount, null, MountStatus.UP);
                return;
            }
        } else {
            this.logger.verbose(`Found ${files.length} new files (total: ${result?.totalFiles}) on mount '${mount.name}'. Took ${result?.timeMs}ms.`);
        }

        // Do necessary status updates, like saving and emitting progress update.
        // Note: If there were no files found and the flag is not set to RESCAN,
        // then this code will never be reached.
        await this.mountService.setProgressInfoAndEmit(mount, {
            mountId: mount.id,
            maxSteps: MOUNT_MAX_STEPS,
            currentStep: CURRENT_STEP,
            info: MOUNT_STEP_WAITING,
            progress: -1
        });

        // Emit application wide, that new files were found.
        // This is done to trigger next step for all files.
        this.events.emit(EVENT_FILES_FOUND, new FilesFoundEvent(mount, files, flag));
    }

    private async handleOnFailed(job: WorkerJobRef<MountScanProcessDTO>, error: Error) {
        const { mount, flag } = job.payload;

        if(flag === MountScanFlag.DOCKER_LOOKUP) {
            this.logger.error(`Failed looking up mounted directories via docker volumes: ${error.message}`, error.stack);
        } else {
            this.logger.error(`Failed looking for files on mount ${mount.name}: ${error.message}`, error.stack);
            await this.mountService.setProgressInfoAndEmit(mount, null, MountStatus.ERRORED);
        }
    }
}