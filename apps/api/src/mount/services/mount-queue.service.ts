import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job, Queue } from "bull";
import { EVENT_FILE_FOUND, QUEUE_MOUNTSCAN_NAME } from "../../constants";
import { BullQueueService } from "../../utils/services/bull-queue.service";
import { MountScanProcessDTO } from "../dtos/mount-scan.dto";
import { MountScanResultDTO } from "../dtos/scan-result.dto";
import { MountGateway } from "../gateway/mount.gateway";
import { ProgressInfoDTO } from "../worker/progress-info.dto";
import { MountService } from "./mount.service";

@Injectable()
export class MountQueueService extends BullQueueService<MountScanProcessDTO, MountScanResultDTO, ProgressInfoDTO> {

    constructor(
        private readonly mountService: MountService,
        private readonly gateway: MountGateway,
        private readonly events: EventEmitter2,
        @InjectQueue(QUEUE_MOUNTSCAN_NAME) queue: Queue<MountScanProcessDTO>
    ) {
        super("Mount Queue", queue, Boolean(process.env.DEBUG));
    }

    protected async onJobFailed(job: Job<MountScanProcessDTO>, error: Error) {
        if(!this.debug) {
            this.logger.error(`Failed scanning mount ${job.data.mount.name}: ${error.message}`);
        } else {
            this.logger.error(`Failed scanning mount ${job.data.mount.name}: ${error.message}`, error.stack);
        }
    }

    protected async onJobCompleted(job: Job<MountScanProcessDTO>, result: MountScanResultDTO) {
        this.gateway.sendMountUpdateEvent(job.data.mount, null);
        this.mountService.updateLastScanned(job.data.mount);

        for(const file of result.files) {
            this.events.emit(EVENT_FILE_FOUND, file);
        }

        this.logger.verbose(`Scanned mount ${job.data.mount.name}. Took ${result.timeMs}ms.`);
    }

    protected async onJobStalled(job: Job<MountScanProcessDTO>) {
        this.logger.warn(`Scanning mount ${job.data.mount.name} did not send any updates. Marking job as stalled.`);
    }

    protected async onJobActive(job: Job<MountScanProcessDTO>) {
        this.logger.verbose(`Now scanning mount ${job.data.mount.name}`);
    }

    protected async onQueueResumed(job: Job<MountScanProcessDTO>) {
        this.logger.verbose(`The Queue has been resumed. Continueing with scanning mount ${job?.data?.mount?.name}`)
    }

    protected async onJobProgress(job: Job<MountScanProcessDTO>, progress: ProgressInfoDTO): Promise<void> {
        this.gateway.sendMountUpdateEvent(job.data.mount, progress);
    }

}