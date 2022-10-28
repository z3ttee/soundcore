import { WorkerJob } from "../entities/worker-job.entity";
import { WorkerExecutionEvent } from "./worker.event";

export class WorkerCompletedEvent extends WorkerExecutionEvent {

    constructor(job: WorkerJob) {
        super("completed", job);
    }

}