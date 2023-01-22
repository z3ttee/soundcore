import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import path from "node:path";
import { WorkerPool, pool } from "workerpool";
import { PIPELINES_MODULE_OPTIONS, PIPELINES_TOKEN } from "../../constants";
import { Environment, Pipeline } from "../entities/pipeline.entity";
import { PipelineQueue } from "../entities/queue.entity";
import { EventHandler, EventName } from "../event/event";
import { PipelineCompletedEventHandler, PipelineFailedEventHandler } from "../event/pipeline-events";
import { PipelineModuleOptions, Pipelines } from "../pipeline.module";

@Injectable()
export class PipelineService {
    private readonly logger = new Logger(PipelineService.name);

    private readonly pool: WorkerPool;
    private readonly queue: PipelineQueue = new PipelineQueue();

    private readonly running: Pipeline[] = [];

    private readonly eventHandlers: Map<EventName, EventHandler<EventName>> = new Map();

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
        // Copy object
        const pipeline = {...this.registeredPipelines[pipelineId]};

        // Merge environments, global env overwrites
        pipeline.environment = {
            ...environment,
            ...pipeline.environment
        }

        return this.queue.enqueue(pipeline);
    }

    public on<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        if(this.eventHandlers.has(eventName)) {
            this.logger.warn(`Cannot register events twice.`);
            return;
        }

        this.eventHandlers.set(eventName, handler);
    }

    private async dispatch(pipeline: Pipeline): Promise<void> {
        if(!this.canExecuteNext()){
            await this.queue.enqueue(pipeline);
            return;
        }

        this.pool.exec("default", [ pipeline ], {
            on: (payload: { name: EventName, [key: string]: any }) => {
                const { name, ...args } = payload;

                const handler = this.eventHandlers.get(name) as unknown;
                if(typeof handler !== "function") return;
                handler(...Object.values(args));
            }
        }).then((pipeline: Pipeline) => {
            const handler = this.eventHandlers.get("pipeline:failed") as PipelineCompletedEventHandler;
            if(typeof handler !== "function") return;
            handler(pipeline);
        }).catch((error: Error) => {
            const handler = this.eventHandlers.get("pipeline:failed") as PipelineFailedEventHandler;
            if(typeof handler !== "function") return;
            handler(error, pipeline);
        });
    }

    private canExecuteNext(): boolean {
        const maxRunning = this.options.concurrent ?? 1;
        // could potentially be wrong property to ask...
        const running = this.pool.stats().busyWorkers;

        return maxRunning > running;
    }

}