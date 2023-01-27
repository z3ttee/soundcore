import { DynamicModule, Logger, Module } from "@nestjs/common";
import path from "node:path";
import { PIPELINES_MODULE_OPTIONS, PIPELINES_TOKEN } from "../constants";
import { PipelineBuilder, PipelineOptions, PipelineWithScript } from "./entities/pipeline.entity";
import { Stage } from "./entities/stage.entity";
import { Step } from "./entities/step.entity";
import { PipelineService } from "./services/pipeline.service";


// TODO: Make service global to share queue, do that by creating a global pipelines registry

export type Pipelines = { [id: string]: PipelineWithScript };
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

    pipelineScripts: string[]
}

@Module({

})
export class PipelineModule {
    private static readonly logger = new Logger(PipelineModule.name);

    public static forFeature(options: PipelineModuleOptions): DynamicModule {
        const pipelines: Pipelines = {};

        for(const script of (options.pipelineScripts ?? [])) {
            const filepath = path.resolve(script);
            const pipeline = createPipelineFromBuilder(filepath);

            if(pipelines[pipeline.id]) {
                PipelineModule.logger.warn(`Found duplicate pipeline id. Please make sure that ids are unique.`);
                continue;
            }

            pipelines[pipeline.id] = pipeline;
        }

        console.log(pipelines);

        return {
            module: PipelineModule,
            providers: [
                {
                    provide: PIPELINES_TOKEN,
                    useValue: pipelines
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

function createPipelineFromBuilder(filepath: string): PipelineWithScript {
    const builderFn: () => PipelineBuilder = require(filepath)?.default;
    console.log(builderFn);


    if(typeof builderFn !== "function") throw new Error(`Invalid pipeline. Script file must have a function as default export returning an instance of PipelineBuilder.`);
    if(builderFn["then"]) throw new Error(`Invalid pipeline. The default export cannot be a Promise.`);

    const builder = builderFn();

    console.log(builder);
    console.log("==================")

    const options: PipelineOptions = {
        concurrent: builder["_concurrent"] ?? 1
    };

    const stages: Stage[] = builder["_stages"].map((builder) => {
        return new Stage(builder["id"], builder["name"], builder["_steps"].map((stepBuilder) => {
            return new Step(stepBuilder["id"], stepBuilder["name"], stepBuilder["_runner"]);
        }))
    });

    return new PipelineWithScript(filepath, options, builder["id"], builder["name"], stages, builder["_environment"]);
}