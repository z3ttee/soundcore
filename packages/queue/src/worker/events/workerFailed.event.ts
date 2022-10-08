import { WorkerJob } from "../entities/worker-job.entity";
import { WorkerExecutionEvent } from "./worker.event";

export class WorkerFailedEvent extends WorkerExecutionEvent {

    constructor(job: WorkerJob, error: Error) {
        super("failed", job, error);
    }

}