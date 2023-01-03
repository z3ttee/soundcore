import { WorkerJobRef } from "../entities/worker-job.entity";
import { WorkerExecutionEvent } from "./worker.event";

export class WorkerFailedEvent extends WorkerExecutionEvent {

    constructor(job: WorkerJobRef, error: Error) {
        super("failed", job, error);
    }

}