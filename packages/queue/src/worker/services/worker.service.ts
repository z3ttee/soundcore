import { Injectable } from "@nestjs/common";
import workerpool from "workerpool";
import { WorkerQueueOptions } from "../worker.module";
import { WorkerQueue } from "../entities/worker-queue.entity";
import { Worker } from "../entities/worker.entity";

@Injectable()
export class WorkerService {

    private readonly _pool: workerpool.WorkerPool;

    constructor(
        private readonly options: WorkerQueueOptions,
        private readonly queue: WorkerQueue
    ) {
        // Create worker pool
        this._pool = workerpool.pool(this.options.script, {
            workerType: this.options.workerType || "thread",
            minWorkers: 1,
            maxWorkers: this.options.concurrent || 1
        });
        
        // Listen to events
        this.queue.on("waiting", (size: number) => {
            console.log("worker queue size: ", size);
        });

        this.queue.on("drained", () => {
            console.log("queue empty");
        });

        this.queue.on("started", (worker: Worker) => {
            console.log("Worker with id " + worker.id + " started with next item.");
        });

        this.queue.on("completed", (worker: Worker, result: any) => {
            console.log("Worker with id " + worker.id + " completed task. Result: " + JSON.stringify(result));
        });

        this.queue.on("progress", (worker: Worker, progress: number) => {
            console.log("Worker with id " + worker.id + " posted progress: " + progress);
        });

        this.queue.on("failed", (worker: Worker, error: Error) => {
            console.log("Worker with id " + worker.id + " reported an error: " + error.message);
            console.error(error);
        });
    }

    

}