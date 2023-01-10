import { Injectable, Logger } from "@nestjs/common";
import { WorkerJob, WorkerQueue } from "@soundcore/nest-queue";
import { GeniusProcessDTO } from "../dtos/genius-process.dto";

@Injectable()
export class GeniusQueueService {
    private readonly logger = new Logger(GeniusQueueService.name);

    constructor(
        private readonly queue: WorkerQueue<GeniusProcessDTO>
    ) {
        this.queue.on("started", (job: WorkerJob<GeniusProcessDTO, any>) => {
            
        });
    }

    // protected async onJobFailed(job: Job<GeniusProcessDTO>, error: Error) {
    //     if(!this.debug) {
    //         this.logger.error(`Failed looking up ${job.data.payload.resourceType} with name ${job.data.payload.name} on genius.com: ${error.message}`);
    //     } else {
    //         this.logger.error(`Failed looking up ${job.data.payload.resourceType} with name ${job.data.payload.name} on genius.com: ${error.message}`, error.stack);
    //     }
    // }

    // protected async onJobCompleted(job: Job<GeniusProcessDTO>, result: Resource) {
    //     this.logger.verbose(`Successfully looked up ${job.data?.payload?.resourceType} wit name '${result?.name}' on genius.`);
    // }

    // protected async onJobStalled(job: Job<GeniusProcessDTO>) {
    //     this.logger.warn(`Detected job that has stalled for a longer period of time. Resource: {type: ${job.data?.payload?.resourceType}, name: ${job.data.payload.name}}`);
    // }

    // protected async onJobActive(job: Job<GeniusProcessDTO>) {
    //     this.logger.verbose(`Now processing job with id ${job.id}. Resource: {type: ${job.data?.payload?.resourceType}, name: ${job.data?.payload?.name}}`);
    // }

    // protected async onQueueResumed(job: Job<GeniusProcessDTO>) {
    //     this.logger.verbose(`The Queue has been resumed. Continueing with job ${job?.id}. Resource: {type: ${job?.data?.payload?.resourceType}, name: ${job?.data?.payload?.name}}`)
    // }

}