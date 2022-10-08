import { Injectable } from "@nestjs/common";
import workerpool from "workerpool";
import { WorkerQueueOptions } from "../worker.module";
import { WorkerQueue } from "../entities/worker-queue.entity";
import { Worker } from "../entities/worker.entity";
import { WorkerExecutionEvent } from "../events/worker.event";
import path from "path";

@Injectable()
export class WorkerService {

    private readonly _pool: workerpool.WorkerPool;
    private readonly _worker = new Worker(path.resolve(this._options.script));

    constructor(
        private readonly _options: WorkerQueueOptions,
        private readonly queue: WorkerQueue,
    ) {
        // Create worker pool
        this._pool = workerpool.pool(path.resolve(__dirname, "..", "worker.js"), {
            workerType: this._options.workerType || "thread",
            minWorkers: 1,
            maxWorkers: this._options.concurrent || 1,
            forkOpts: {
                env: {
                    ...process.env
                }
            }
        });
        
        // Listen to events
        this.queue.on("waiting", () => {
            this.offerNewItemToWorkers();
        });
    }

    private async offerNewItemToWorkers() {
        const stats = this._pool.stats();

        // Only continue, if there are idle workers
        // and if there are no pending tasks
        if(stats.idleWorkers > 0 && stats.pendingTasks <= 0) {
            // For every idle worker, offer them
            // a new task via pool proxy
            for(let i = 0; i < stats.idleWorkers; i++) {
                // Break the loop, if the queue is empty
                if(this.queue.size <= 0) break;

                // Dequeue item from the queue
                const job = await this.queue.dequeue();
                const env = {
                    ...process.env
                }

                this._pool.exec("default", [ env, this._worker, job ], {
                    on: (event: WorkerExecutionEvent) => {
                        this.queue.fireEvent(event.name, event.job, event.error);
                    }
                });
            }
        }
    }

    

}