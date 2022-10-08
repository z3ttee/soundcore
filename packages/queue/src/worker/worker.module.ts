import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from "@nestjs/common";
import { QueueModule, QueueOptions } from "../queue/queue.module";
import { WorkerService } from "./services/worker.service";
import { createRedisOptionsProviderAsync } from "./utils";

export interface WorkerQueueOptions extends QueueOptions {
    /**
     * Path to the javascript script file that contains the
     * worker's code.
     */
    script: string;

    /**
     * Define how many milliseconds the queue waits before
     * processing the next item from the queue.
     * @default 0
     */
    waitBetweenMs?: number;

    /**
     * Define how many workers are processed simultaneously.
     * @default 1
     */
    concurrent?: number;

    /**
     * @default thread
     */
    workerType?: "auto" | "process" | "thread";
}

export interface WorkerQueueModuleOptions {
    defaultWorkerOptions?: WorkerOptions;
    defaultQueueOptions?: WorkerQueueOptions;
}

export interface WorkerQueueAsyncOptions extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
    useFactory: (...args: any[]) => Promise<WorkerQueueModuleOptions> | WorkerQueueModuleOptions;
}

@Module({
    
})
export class WorkerQueueModule {

    public static async forRootAsync(asyncOptions: WorkerQueueAsyncOptions): Promise<DynamicModule> {
        const optionsProvider = createRedisOptionsProviderAsync(asyncOptions);

        return {
            module: WorkerQueueModule,
            global: true,
            providers: [
                optionsProvider
            ],
            exports: [
                optionsProvider
            ]
        }
    }

    public static forFeature(options: WorkerQueueOptions): DynamicModule {
        return {
            module: WorkerQueueModule,
            imports: [
                QueueModule.forFeature(options)
            ],
            providers: [
                WorkerService
            ],
            exports: [
                QueueModule,
                WorkerService
            ]
        }
    }

}