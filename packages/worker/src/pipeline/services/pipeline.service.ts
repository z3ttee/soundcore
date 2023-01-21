import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import path from "node:path";
import { WorkerPool, pool } from "workerpool";
import { PIPELINES_MODULE_OPTIONS, PIPELINES_TOKEN } from "../../constants";
import { Environment, Pipeline } from "../entities/pipeline.entity";
import { PipelineQueue } from "../entities/queue.entity";
import { PipelineModuleOptions, Pipelines } from "../pipeline.module";

@Injectable()
export class PipelineService {

    private readonly pool: WorkerPool;
    private readonly queue: PipelineQueue = new PipelineQueue();

    private readonly running: Pipeline[] = [];

    constructor(
        @Inject(PIPELINES_MODULE_OPTIONS) private readonly options: PipelineModuleOptions,
        @Inject(PIPELINES_TOKEN) private readonly registeredPipelines: Pipelines
    ) {

        // Create worker pool
        this.pool = pool(path.resolve(__dirname, "..", "worker", "pipeline.worker.js"), {
            workerType: this.options.workerType ?? "process",
            minWorkers: 1,
            maxWorkers: Math.max(1, Math.min(0, this.options.concurrent ?? 1)),
            forkOpts: {
                env: {
                    ...process.env
                }
            }
        });
    }

    @Cron("*/10 * * * * *")
    public processNextInQueue() {
        if(this.queue.isEmpty() || !this.canExecuteNext()) return;

        const nextItem = this.queue.dequeue();
        this.dispatch(nextItem);
    }

    public async enqueue(pipelineId: string, environment?: Environment): Promise<number> {
        const pipeline = this.registeredPipelines[pipelineId];

        // Merge environments, global env overwrites
        pipeline.environment = {
            ...environment,
            ...pipeline.environment
        }

        return this.queue.enqueue(pipeline);
    }

    private async dispatch(pipeline: Pipeline): Promise<void> {
        if(!this.canExecuteNext()){
            await this.queue.enqueue(pipeline);
            return;
        }

        this.pool.exec("default", [ pipeline ], {
            on: (payload: { event: string, data: any}) => {
                console.log("received event ", payload.event, payload.data);
            }
        }).then((pipeline: Pipeline) => {
            console.log("pipeline " + pipeline.id + " completed");
        }).catch((error: Error) => {
            console.error(error);
        });
    }

    private canExecuteNext(): boolean {
        const maxRunning = this.options.concurrent ?? 1;
        // could potentially be wrong property to ask...
        const running = this.pool.stats().busyWorkers;

        return maxRunning > running;
    }

}