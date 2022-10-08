import { WorkerJob } from "../entities/worker-job.entity";
import { WorkerExecutionEvent } from "./worker.event";

export class WorkerProgressEvent extends WorkerExecutionEvent {

    constructor(job: WorkerJob) {
        super("progress", job);
    }

}