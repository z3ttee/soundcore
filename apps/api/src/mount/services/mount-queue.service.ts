import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_FILES_FOUND } from "../../constants";
import { FilesFoundEvent } from "../../events/files-found.event";
import { MountScanResultDTO } from "../dtos/scan-result.dto";
import { Mount } from "../entities/mount.entity";
import { MountService } from "./mount.service";
import { AdminGateway } from "../../gateway/gateways/admin-gateway.gateway";
import { MountStatus } from "../enums/mount-status.enum";
import { Environment } from "@soundcore/common";
import { MountScanProcessDTO } from "../dtos/scan-process.dto";

@Injectable()
export class MountQueueService {
    private logger = new Logger(MountQueueService.name);

    constructor(
        private readonly mountService: MountService,
        private readonly adminGateway: AdminGateway,
        private readonly events: EventEmitter2,
        private readonly queue: WorkerQueue<MountScanProcessDTO>
    ) {

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
            const { mount } = payload;

            // Update status
            this.mountService.setMountStatus(mount, MountStatus.SCANNING);

            this.logger.verbose(`Looking for files on mount '${mount.name}'...`);
        });

        // Completed
        this.queue.on("completed", async (job: WorkerJob<MountScanProcessDTO, MountScanResultDTO>) => {
            const { payload, result } = job;
            const { mount } = payload;

            this.mountService.setMountStatus(mount, MountStatus.UP);
            this.adminGateway.sendMountStatusUpdate(mount, null);
            this.mountService.updateLastScanned(mount);

            const files = result?.files || [];

            // this.events.emit(EVENT_TRIGGER_FILE_PROCESS_BY_FLAG, new FilesFoundEvent(job.payload, []));

            if(files.length <= 0) {
                this.logger.verbose(`No new files found (total: ${result?.totalFiles}) on mount '${mount.name}'. Took ${job.result?.timeMs}ms.`);
                return;
            }

            this.logger.verbose(`Found ${files.length} new files (total: ${result?.totalFiles}) on mount '${mount.name}'. Took ${job.result?.timeMs}ms.`);
            this.events.emit(EVENT_FILES_FOUND, new FilesFoundEvent(mount, files));
        });

        // Progress
        this.queue.on("progress", async (job: WorkerJobRef<MountScanProcessDTO>) => {
            const { mount } = job.payload;

            if(Environment.isDebug) {
                this.logger.debug(`Received progress update from mount ${mount.name}: ${job.progress}`);
            }

            this.mountService.setMountStatus(mount, MountStatus.SCANNING);
            this.adminGateway.sendMountStatusUpdate(mount, job.progress);
        });

        // Failed
        this.queue.on("failed", async (job: WorkerJobRef<MountScanProcessDTO>, error: Error) => {
            const { mount } = job.payload;
            this.logger.error(`Failed looking for files on mount ${mount.name}: ${error.message}`, error.stack);
            this.mountService.setMountStatus(mount, MountStatus.UP);
        });
    }
}