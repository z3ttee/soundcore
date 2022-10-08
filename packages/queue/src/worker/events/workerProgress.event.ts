import { WorkerJobRef } from "../entities/worker-job.entity";
import { WorkerExecutionEvent } from "./worker.event";

export class WorkerProgressEvent extends WorkerExecutionEvent {

    constructor(job: WorkerJobRef) {
        super("progress", job);
    }

}