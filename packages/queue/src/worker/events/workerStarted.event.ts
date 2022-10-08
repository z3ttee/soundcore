import { WorkerJob } from "../entities/worker-job.entity";
import { WorkerExecutionEvent } from "./worker.event";

export class WorkerStartedEvent extends WorkerExecutionEvent {

    constructor(job: WorkerJob) {
        super("started", job);
    }

}