import { DynamicModule, Logger, Module } from "@nestjs/common";
import { PIPELINES_MODULE_OPTIONS, PIPELINES_TOKEN } from "../constants";
import { Pipeline, PipelineOptions } from "./entities/pipeline.entity";
import { Stage } from "./entities/stage.entity";
import { Step } from "./entities/step.entity";
import { PipelineService } from "./services/pipeline.service";

// TODO: Make service global to share queue, do that by creating a global pipelines registry

export type Pipelines = { [id: string]: Pipeline };
export interface PipelineModuleOptions {

    /**
     * Define the time interval (in seconds) for the queue to look for
     * newly added pipelines. Reducing the number will cause shorter
     * delays on enqeued items. Use this with causion as it is the interval
     * in which the queue is asked for new items (always causing a check).
     * Minimum is 1000 and maximum is 60000
     * @default 10000
     */
    pollingRateMs?: number;

    /**
     * Disable automatic file logging.
     * @default false
     */
    disableLogging?: boolean;

    /**
     * Enable writing pipeline outputs to console of
     * main application. This requires setting disableLogging
     * to false
     * @default false
     */
    enableConsoleLogging?: boolean;

    /**
     * Amount of concurrently running pipelines in this module
     * @default 1
     */
    concurrent?: number;

    /**
     * Worker type
     * @default process
     */
    workerType?: "process" | "auto" | "web" | "thread";
}

@Module({

})
export class PipelineModule {

    public static registerPipelines(options: PipelineModuleOptions, pipelines: PipelineOptions[]): DynamicModule {
        const logger = new Logger(PipelineModule.name);

        const initializedPipelines: Pipelines = {};
        for(const pipelineOptions of pipelines) {
            if(initializedPipelines[pipelineOptions.id]) {
                logger.warn(`Pipelines must have unique ids: Pipeline with id '${pipelineOptions.id}' is already registered.`);
                continue;
            }
            
            initializedPipelines[pipelineOptions.id] = new Pipeline(pipelineOptions.id, pipelineOptions.name, pipelineOptions.stages.map((stageOptions) => {
                return new Stage(stageOptions.id, stageOptions.name, stageOptions.scriptPath, stageOptions.steps.map((stepOptions) => {
                    return new Step(stepOptions.id, stepOptions.name, {});
                }), {});
            }), {});
        }

        return {
            module: PipelineModule,
            providers: [
                {
                    provide: PIPELINES_TOKEN,
                    useValue: initializedPipelines
                },
                {
                    provide: PIPELINES_MODULE_OPTIONS,
                    useValue: options
                },
                PipelineService
            ],
            exports: [
                PipelineService
            ]
        }
    }

}