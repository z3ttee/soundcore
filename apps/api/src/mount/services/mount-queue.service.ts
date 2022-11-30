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

@Injectable()
export class MountQueueService {
    private logger = new Logger(MountQueueService.name);

    constructor(
        private readonly mountService: MountService,
        private readonly adminGateway: AdminGateway,
        private readonly events: EventEmitter2,
        private readonly queue: WorkerQueue<Mount>
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

        this.queue.on("started", async (job: WorkerJob<Mount>) => {
            const { payload } = job;

            // Update status
            this.mountService.setMountStatus(payload, MountStatus.SCANNING);

            this.logger.verbose(`Looking for files on mount '${payload.name}'...`);
        });

        // Completed
        this.queue.on("completed", async (job: WorkerJob<Mount, MountScanResultDTO>) => {
            const { payload, result } = job;

            this.mountService.setMountStatus(job.payload, MountStatus.UP);
            this.adminGateway.sendMountStatusUpdate(job.payload, null);
            this.mountService.updateLastScanned(job.payload);

            const files = result?.files || [];

            // this.events.emit(EVENT_TRIGGER_FILE_PROCESS_BY_FLAG, new FilesFoundEvent(job.payload, []));

            if(files.length <= 0) {
                this.logger.verbose(`No new files found (total: ${result?.totalFiles}) on mount '${payload.name}'. Took ${job.result?.timeMs}ms.`);
                return;
            }

            this.logger.verbose(`Found ${files.length} new files (total: ${result?.totalFiles}) on mount '${payload.name}'. Took ${job.result?.timeMs}ms.`);
            this.events.emit(EVENT_FILES_FOUND, new FilesFoundEvent(job.payload, files));
        });

        // Progress
        this.queue.on("progress", async (job: WorkerJobRef<Mount>) => {
            if(Environment.isDebug) {
                this.logger.debug(`Received progress update from mount ${job.payload.name}: ${job.progress}`);
            }

            this.mountService.setMountStatus(job.payload, MountStatus.SCANNING);
            this.adminGateway.sendMountStatusUpdate(job.payload, job.progress);
        });

        // Failed
        this.queue.on("failed", async (job: WorkerJobRef<Mount>, error: Error) => {
            this.logger.error(`Failed looking for files on mount ${job.payload.name}: ${error.message}`, error.stack);
            this.mountService.setMountStatus(job.payload, MountStatus.UP);
        });
    }
}