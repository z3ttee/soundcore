import path from "node:path";
import crypto from "node:crypto";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { WorkerPool, pool } from "workerpool";
import { PIPELINES_MODULE_OPTIONS, PIPELINES_TOKEN } from "../../constants";
import { Environment, Pipeline, PipelineRun, PipelineStatus, PipelineWithScript } from "../entities/pipeline.entity";
import { PipelineQueue } from "../entities/queue.entity";
import { EventHandler, EventName } from "../event/event";
import { PipelineCompletedEventHandler, PipelineFailedEventHandler } from "../event/pipeline-events";
import { PipelineModuleOptions, Pipelines } from "../pipeline.module";
import { SkippedException } from "../exceptions/skipped.exception";
import { AbortException } from "../exceptions/abort.exception";

@Injectable()
export class PipelineService {
    private readonly logger = new Logger(PipelineService.name);

    private readonly pool: WorkerPool;
    private readonly queue: PipelineQueue = new PipelineQueue();

    private readonly running: Pipeline[] = [];

    private readonly eventHandlers: Map<EventName, EventHandler<EventName>[]> = new Map();

    constructor(
        @Inject(PIPELINES_MODULE_OPTIONS) private readonly options: PipelineModuleOptions,
        @Inject(PIPELINES_TOKEN) private readonly registeredPipelines: Pipelines,
        private readonly scheduler: SchedulerRegistry
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

        // Register polling interval
        const intervalName = "pipeline-queue-lookup-"+crypto.randomUUID()
        if(!this.scheduler.doesExist("interval", intervalName)) {
            this.scheduler.addInterval(intervalName, setInterval(() => {
                this.processNextInQueue();
            }, Math.max(1000, Math.min(60000, this.options.pollingRateMs ?? 10000))));
        }
    }

    private processNextInQueue() {
        if(this.queue.isEmpty() || !this.canExecuteNext()) return;
        const nextItem = this.queue.dequeue();
        this.dispatch(nextItem);
    }

    /**
     * Enqueue a pipeline by its id.
     * @param pipelineId Id of the pipeline to trigger
     * @param environment Additional environmental data
     * @returns Position in queue
     */
    public async enqueue(pipelineId: string, environment?: Environment): Promise<number> {
        const origin: PipelineWithScript = this.registeredPipelines[pipelineId];
        if(typeof origin === "undefined" || origin == null) {
            throw new Error(`No pipeline found for id '${pipelineId}'`);
        }

        // Copy object
        const pipeline: PipelineWithScript = new PipelineWithScript(origin.script, origin.options, origin.id, origin.name, origin.stages, <Environment>{
            // Merge environments, global env overwrites
            ...environment,
            ...origin.environment ?? {}
        });

        const position = this.queue.enqueue(pipeline);
        this.logger.log(`Enqueued new run for pipeline '${pipelineId}'. Position in queue: ${position}`);
        return position;
    }

    /**
     * Register an event handler.
     * @param eventName Name of the event
     * @param handler Handler for the event
     */
    public on<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        const handlers = this.eventHandlers.get(eventName) ?? [];
        handlers.push(handler);
        this.eventHandlers.set(eventName, handlers);
    }

    /**
     * Unregister an event handler
     * @param eventName Name of the event to unregister
     * @param handler Handler to remove
     */
    public off<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        const handlers = this.eventHandlers.get(eventName) ?? [];
        const index = handlers.findIndex((h) => h == handler);
        if(index == -1) return;

        handlers.splice(index, 1);
        this.eventHandlers.set(eventName, handlers);
    }

    /**
     * Dispatch a new pipeline. This will send the pipeline information and environment to a
     * worker. This function subscribes to events and translates them for further event handlers.
     * This is done before any handler is called that was registered via on() function.
     * Note: If this function was called falsely (workers are busy), the pipeline will be re-enqueued.
     * @param pipeline Pipeline information
     */
    private async dispatch(pipeline: PipelineRun): Promise<void> {
        // Check if workers are busy, if so enqueue the pipeline
        if(!this.canExecuteNext()){
            await this.queue.enqueue(pipeline);
            return;
        }

        // Execute the pipeline in the worker pool
        this.pool.exec("default", [ pipeline, this.options ], {
            // Subscribe to any event
            on: (payload: { name: EventName, [key: string]: any }) => {
                const { name, ...args } = payload;

                const handlers = this.eventHandlers.get(name) as ((...args: any[]) => void)[] ?? [];
                for(const handler of handlers) {
                    handler(...Object.values(args));
                }
            }
        }).then((pipeline: PipelineRun) => {
            // Update pipeline status
            pipeline.status = PipelineStatus.COMPLETED;
            pipeline.currentStage = null;

            // Handle successful completion
            const handlers = this.eventHandlers.get("pipeline:completed") as PipelineCompletedEventHandler[] ?? [];
            for(const handler of handlers) {
                handler(pipeline);
            }
        }).catch((error: Error) => {
            // Update pipeline status
            pipeline.currentStage = null;
            pipeline.status = PipelineStatus.FAILED;

            if(error instanceof SkippedException || error instanceof AbortException) {
                pipeline.status = error instanceof AbortException ? PipelineStatus.WARNING : PipelineStatus.COMPLETED;

                // Handle successful completion
                const handlers = this.eventHandlers.get("pipeline:completed") as PipelineCompletedEventHandler[] ?? [];
                for(const handler of handlers) {
                    handler(pipeline);
                }
                return;
            }

            // Handle errored completion
            const handlers = this.eventHandlers.get("pipeline:failed") as PipelineFailedEventHandler[] ?? [];
            for(const handler of handlers) {
                handler(error, pipeline);
            }
        });
    }

    private canExecuteNext(): boolean {
        const maxRunning = this.options.concurrent ?? 1;
        // could potentially be wrong property to ask...
        const running = this.pool.stats().busyWorkers;

        return maxRunning > running;
    }

}