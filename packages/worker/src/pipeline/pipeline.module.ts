import { DynamicModule, Logger, Module } from "@nestjs/common";
import { PIPELINES_MODULE_OPTIONS, PIPELINES_TOKEN } from "../constants";
import { Pipeline, PipelineOptions, Stage, Step } from "./entities/pipeline.entity";
import { PipelineService } from "./services/pipeline.service";

export type Pipelines = { [id: string]: Pipeline };
export interface PipelineModuleOptions {

    /**
     * Disable automatic file logging.
     * @default false
     */
    disableLogging?: boolean;

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