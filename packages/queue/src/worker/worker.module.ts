import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from "@nestjs/common";
import { WORKERQUEUE_FEATURE_OPTIONS } from "../constants";
import { QueueOptions } from "../queue/queue.module";
import { WorkerQueue } from "./entities/worker-queue.entity";
import { WorkerService } from "./services/worker.service";
import { createRedisOptionsProviderAsync } from "./utils";


export interface WorkerQueueOptions extends QueueOptions {

    /**
     * @default thread
     */
    workerType?: "auto" | "process" | "thread";

    /**
     * Path to the javascript script file that contains the
     * worker's code.
     */
    script: string;

    /**
     * Define how many workers are processed simultaneously.
     * @default 1
     */
    concurrent?: number;
}

export interface WorkerQueueModuleOptions {
    defaultQueueOptions?: {} 
        & Pick<WorkerQueueOptions, "concurrent"> 
        & Pick<WorkerQueueOptions, "workerType"> 
        & Pick<WorkerQueueOptions, "debounceMs">;
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
                
            ],
            providers: [
                {
                    provide: WORKERQUEUE_FEATURE_OPTIONS,
                    useValue: options
                },
                {
                    provide: WorkerQueue,
                    useFactory: () => {
                        return new WorkerQueue(options);
                    }
                },
                WorkerService
            ],
            exports: [
                WorkerQueue
            ]
        }
    }

}