import { WorkerJob, WorkerJobRef } from "../entities/worker-job.entity";
import { WorkerEventName } from "../entities/worker-queue.entity";

export abstract class WorkerExecutionEvent {

    constructor(
        public readonly name: WorkerEventName,
        public readonly job: WorkerJob | WorkerJobRef,
        public readonly error?: Error
    ) {}

}