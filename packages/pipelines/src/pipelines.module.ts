import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GLOBAL_OPTIONS_TOKEN, LOCAL_OPTIONS_TOKEN } from "./constants";
import { PipelineEventService } from "./services/pipeline-event.service";
import { PipelineQueue } from "./services/pipeline-queue.service";
import { PipelineRegistry } from "./services/pipeline-registry.service";
import { PipelineService } from "./services/pipelines.service";
import { buildDefinitionsFromFiles } from "./utils/registerPipelines";

export interface PipelineGlobalOptions {    
    /**
     * Enable printing the logs of a pipeline run to the console.
     * @default false
     */
    enableStdout?: boolean;

    /**
     * Disable printing logs to a log file
     * @default false
     */
    disableFileLogs?: boolean;

    logsDirectory?: string;
}

export interface PipelineLocalOptions {
    /**
     * List of filepaths to pipeline script file
     * If no files are defined, the application recursively looks
     * for files ending with .pipeline.js that can be registered as pipeline
     */
    pipelines: string[];

    /**
     * Maximum amount of concurrently running pipelines
     * @default 1
     */
    concurrent?: number;

    /**
     * Define the time interval (in milliseconds) for the queue to look for
     * newly added pipelines. Reducing the number will cause shorter
     * delays on enqeued items. Use this with causion as it is the interval
     * in which the queue is asked for new items (always causing a check).
     * Minimum is 1000 and maximum is 60000
     * @default 10000
     */
    pollingRateMs?: number;

    /**
     * Time in milliseconds used to debounce status events of pipelines.
     * This will collect the latest status updates (during the given time frame) and push them in a single
     * event.
     * @default 100
     */
    debounceStatus?: number;
}

const globalRegistry = new PipelineRegistry();

@Module({})
export class PipelineModule {

    public static forRoot(options?: PipelineGlobalOptions): DynamicModule {
        return {
            module: PipelineModule,
            global: true,
            providers: [
                {
                    provide: PipelineRegistry,
                    useValue: globalRegistry
                },
                {
                    provide: GLOBAL_OPTIONS_TOKEN,
                    useValue: options ?? {}
                }
            ],
            exports: [
                GLOBAL_OPTIONS_TOKEN,
                PipelineRegistry
            ]
        }
    }

    public static registerPipelines(options: PipelineLocalOptions): DynamicModule {
        const pipelineFiles = options.pipelines ?? [];
        const definitions = buildDefinitionsFromFiles(pipelineFiles);

        globalRegistry.registerAll(definitions);

        return {
            module: PipelineModule,
            providers: [
                PipelineService,
                PipelineQueue,
                PipelineEventService,
                {
                    provide: LOCAL_OPTIONS_TOKEN,
                    useValue: options
                },
                {
                    provide: PipelineRegistry,
                    useValue: globalRegistry
                },
            ],
            exports: [
                PipelineService
            ]
        }
    }

}