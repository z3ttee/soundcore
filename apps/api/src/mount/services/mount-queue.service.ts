import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkerJob, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_FILES_FOUND } from "../../constants";
import { FilesFoundEvent } from "../../events/files-found.event";
import { Mount } from "../entities/mount.entity";
import { MountGateway } from "../gateway/mount.gateway";
import { MountService } from "./mount.service";

@Injectable()
export class MountQueueService {
    private logger = new Logger(MountQueueService.name);

    constructor(
        private readonly mountService: MountService,
        private readonly gateway: MountGateway,
        private readonly events: EventEmitter2,
        private readonly queue: WorkerQueue<Mount>
    ) {
        this.queue.on("waiting", async (size: number) => {
            this.logger.debug(`Queue size: ${size}`);
        });

        this.queue.on("drained", async () => {
            this.logger.verbose(`All jobs concerning scanning for new files have been distributed to workers. Waiting for new jobs...`);
        });

        this.queue.on("started", async (job: WorkerJob<Mount>) => {
            this.logger.verbose(`Now scanning mount ${job.payload.name}`);
        });

        // Completed
        this.queue.on("completed", async (job: WorkerJob<Mount>) => {
            this.gateway.sendMountUpdateEvent(job.payload, null);
            this.mountService.updateLastScanned(job.payload);

            const files = job.result?.files || [];
            if(files.length > 0) {
                this.events.emit(EVENT_FILES_FOUND, new FilesFoundEvent(job.payload, files));
            }

            this.logger.verbose(`Scanned mount ${job.payload.name}. Took ${job.result?.timeMs}ms.`);
        });

        // Progress
        this.queue.on("progress", async (job: WorkerJob<Mount>, progress: number) => {
            console.log("Mount " + job.payload.id + " posted progress: " + progress);
            this.gateway.sendMountUpdateEvent(job.payload, progress);
        });

        // Failed
        this.queue.on("failed", async (job: WorkerJob<Mount>, error: Error) => {
            this.logger.error(`Failed scanning mount ${job.payload.name}: ${error.message}`, error.stack);
        });
    }

    // protected async onJobStalled(job: Job<MountScanProcessDTO>) {
    //     // this.logger.warn(`Scanning mount ${job.data.mount.name} did not send any updates. Marking job as stalled.`);
    // }

}