import { WorkerJob } from "../entities/worker-job.entity";
import { WorkerEventName } from "../entities/worker-queue.entity";

export abstract class WorkerExecutionEvent {

    constructor(
        public readonly name: WorkerEventName,
        public readonly job: WorkerJob,
        public readonly error?: Error
    ) {}

}