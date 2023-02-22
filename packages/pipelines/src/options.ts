import { FactoryProvider, ModuleMetadata } from "@nestjs/common";

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

export type AsyncPipelineGlobalOptions = {
    useFactory: (...args: any[]) => Promise<PipelineGlobalOptions> | PipelineGlobalOptions;
} & Pick<ModuleMetadata, 'imports'> & Pick<FactoryProvider, 'inject'>

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