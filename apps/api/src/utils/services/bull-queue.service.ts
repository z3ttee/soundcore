import { Logger } from "@nestjs/common";
import Bull, { Job, Queue } from "bull";

export abstract class BullQueueService<T = any, R = any, P = any> {
    protected readonly logger: Logger = new Logger(this.loggerContext);

    constructor(
        private readonly loggerContext: string,
        protected readonly queue: Queue<T>,
        protected readonly debug?: boolean
    ) {
        this.queue?.on("failed", (job, err) => this.onJobFailed(job, err));
        this.queue?.on("completed", (job, result) => this.onJobCompleted(job, result));
        this.queue?.on("active", (job) => this.onJobActive(job));
        this.queue?.on("stalled", (job) => this.onJobStalled(job));
        this.queue?.on("progress", (job, progress: P) => this.onJobProgress(job, progress));

        this.queue?.on("error", (err) => this.onQueueError(err));
        this.queue?.on("drained", () => this.onQueueDrained());
        this.queue?.on("waiting", (jobId) => this.onJobWaiting(jobId));
        this.queue?.on("removed", (job) => this.onJobRemoved(job));
        this.queue?.on("cleaned", (jobs, type) => this.onQueueCleaned(jobs, type));
        this.queue?.on("paused", () => this.onQueuePaused());
        this.queue?.on("resumed", (job) => this.onQueueResumed(job));
    }

    protected abstract onJobFailed(job: Job<T>, error: Error): Promise<void>;
    protected abstract onJobActive(job: Job<T>): Promise<void>;
    protected abstract onJobCompleted(job: Job<T>, result: R): Promise<void>;
    protected abstract onJobStalled(job: Job<T>): Promise<void>;

    protected async onQueueError(error: Error) {
        this.logger.error(`Fatal error occured while processing queue: ${error.message}`, error.stack);
    }

    protected async onQueueDrained() {
        this.logger.verbose(`Done processing all items of the queue.`);
    }

    protected async onJobWaiting(jobId: Bull.JobId) {
        if(this.debug) {
            this.logger.verbose(`New job waiting to be processed. JobID: ${jobId}`);
        }
    }

    protected async onJobProgress(job: Job<T>, progress: P) {
        if(this.debug) {
            this.logger.verbose(`Job with id ${job.id} has reported progress: ${progress}`);
        }
    }

    protected async onJobRemoved(job: Job<T>) {
        if(this.debug) {
            this.logger.verbose(`Job with id ${job.id} has been removed from the queue`);
        }
    }

    protected async onQueueCleaned(jobs: Bull.Job<T>[], type: Bull.JobStatusClean) {
        if(this.debug) {
            this.logger.verbose(`Cleaned queue and removed ${jobs.length} jobs of type ${type}`);
        }
    }

    protected async onQueuePaused() {
        this.logger.warn(`The Queue has been paused`);
    }

    protected async onQueueResumed(job: Job<T>) {
        this.logger.verbose(`The Queue has been resumed. Continueing with job ${job?.id}`)
    }

    public async empty() {
        return this.queue.empty();
    }

}