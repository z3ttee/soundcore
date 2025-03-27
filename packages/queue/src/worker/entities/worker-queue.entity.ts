import { BaseQueue } from "../../queue";
import { WorkerQueueOptions } from "../worker.module";
import { WorkerJob, WorkerJobRef } from "./worker-job.entity";

export type WorkerEventName = "waiting" | "drained" | "started" | "completed" | "failed" | "progress";

export class WorkerQueue<T = any> extends BaseQueue<WorkerJob<T>, WorkerEventName> {

    constructor(options: WorkerQueueOptions) {
        super(options.debounceMs || 0);

        this.$queue.subscribe((queue) => {
            if (queue.length > 0) {
                const handlers = this._getHandlersForEvent("waiting");
                if (typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            } else {
                const handlers = this._getHandlersForEvent("drained");
                if (typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            }
        })
    }

    public async fireEvent(eventName: WorkerEventName, job: WorkerJob | WorkerJobRef, ...args) {
        const eventHandlers = this._getHandlersForEvent(eventName);
        if (typeof eventHandlers === "undefined" || eventHandlers == null) return;

        const jobData: WorkerJob = job["isRef"] ? WorkerJob.fromRef(job as WorkerJobRef) : job as WorkerJob;

        try {
            if (typeof args === "undefined" || args == null) {
                eventHandlers.forEach((handler) => handler(jobData));
            } else {
                eventHandlers.forEach((handler) => handler(jobData, ...args));
            }
        } catch (error) {
            console.error(error);
        }
    }

    public override enqueue(payload: any): Promise<number> {
        const job = new WorkerJob<T>(payload);
        return super.enqueue(job);
    }

}