import { BaseQueue } from "../../shared/queue-interface";
import { WorkerQueueOptions } from "../worker.module";
import { WorkerJob, WorkerJobRef } from "./worker-job.entity";

export type WorkerEventName = "waiting" | "drained" | "started" | "completed" | "failed" | "progress";

export class WorkerQueue<T = any> extends BaseQueue<WorkerJob<T>, WorkerEventName> {

    constructor(private readonly _options: WorkerQueueOptions) {
        super(_options.debounceMs || 0);

        this.$queue.subscribe((queue) => {
            if(queue.length > 0) {
                const handlers = this.eventRegistry.get("waiting");
                if(typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            } else {
                const handlers = this.eventRegistry.get("drained");
                if(typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            }  
        })
    }

    public async fireEvent(eventName: WorkerEventName, job: WorkerJob | WorkerJobRef, ...args) {
        const eventHandlers = this.eventRegistry.get(eventName);
        if(typeof eventHandlers === "undefined" || eventHandlers == null) return;
        
        const jobData: WorkerJob = job["isRef"] ? WorkerJob.fromRef(job as WorkerJobRef) : job as WorkerJob;
        eventHandlers.forEach((handler) => handler(jobData, ...args));
    }

    public override enqueue(payload: any): Promise<number> {
        const job = new WorkerJob<T>(payload);
        return super.enqueue(job);
    }

}