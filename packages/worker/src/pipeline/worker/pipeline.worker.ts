import path from "node:path";
import { Environment, Pipeline, Stage, StageEmitter, StageExecutor, StageRunner } from "../entities/pipeline.entity";
import workerpool from "workerpool";

async function executePipeline(pipeline: Pipeline): Promise<Pipeline> {
    // Initialize outputs object
    pipeline.outputs = {};

    // For loop through stages
    for(const stage of pipeline.stages) {
        try {
            // Initialize outputs for stage
            await executeStage(stage, pipeline.environment);

            // Write outputs to stage id in pipeline
            // outputs
            pipeline.outputs[stage.id] = stage.outputs;
        } catch (error) {
            console.error(error);
            // Do not continue with pipeline
            break;
        }
    }

    return pipeline;
}

async function executeStage(stage: Stage, environment: Readonly<Environment>) {
    const script = path.resolve(stage.scriptPath);
    const stageExecutor: StageExecutor = require(script)?.default;

    // Initialize outputs object
    stage.outputs = {};

    // Execute runner to retrieve steps handler
    const runner: StageRunner = await stageExecutor(environment, stageEmit).catch((error) => {
        throw error;
    });

    // Execute every step 
    for(const step of stage.steps) {
        const stepId = step.id;

        // Check if runner exists
        if(typeof runner.steps?.[stepId] !== "function") {
            throw new Error(`A valid runner for step ${stepId} does not exist.`)
        }

        // Execute step
        await runner.steps?.[stepId]?.(step, environment, stage.outputs);
        // Write step output to stage outputs
        stage.outputs[stepId] = step.outputs ?? {};

        console.log(`step ${stepId} completed. Outputs: `, step.outputs);
    }
}

const stageEmit: StageEmitter = (event: string, data: any) => {
    console.log(`stage emitting event ${event}: `, data);

    workerpool.workerEmit({
        event: event,
        data: data
    });
}

// Create a worker and register public functions
workerpool.worker({
    default: executePipeline
});