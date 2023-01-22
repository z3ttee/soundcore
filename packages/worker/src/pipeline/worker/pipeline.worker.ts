import path from "node:path";
import { Pipeline, Stage, StageExecutor, StageRunner } from "../entities/pipeline.entity";
import workerpool, { workerEmit } from "workerpool";
import { EventName } from "../event/event";

async function executePipeline(pipeline: Pipeline): Promise<Pipeline> {
    emitEvent("pipeline:started", { pipeline });

    // For loop through stages
    for(const stage of pipeline.stages) {
        const stageId = stage.id;

        // Register progress emitter for stage
        stage.progress = (progress: number) => emitEvent("stage:progress", { progress, stage, pipeline });
        // Register message emitter for stage
        stage.message = (message: string) => emitEvent("stage:message", { message, stage, pipeline });
        // Register write emitter for stage
        stage.write = (key: string, value: any) => stage.outputs[key] = value;

        // Initialize outputs for stage
        await executeStage(pipeline, stage).then(() => {
            emitEvent("stage:completed", { stage, pipeline });
        }).catch((error: Error) => {
            emitEvent("stage:failed", { error, stage, pipeline });
            throw error;
        });

        // Write outputs to stage id in pipeline
        // outputs
        pipeline.outputs[stageId] = stage.outputs;
    }

    return pipeline;
}

async function executeStage(pipeline: Pipeline, stage: Stage) {
    emitEvent("stage:started", { stage, pipeline });

    const script = path.resolve(stage.scriptPath);
    const stageExecutor: StageExecutor = require(script)?.default;

    // Execute runner to retrieve steps handler
    const runner: StageRunner = await stageExecutor(stage, pipeline.environment).catch((error) => {
        throw error;
    });

    // Execute every step 
    for(const step of stage.steps) {
        const stepId = step.id;

        // Check if runner exists
        if(typeof runner.steps?.[stepId] !== "function") {
            throw new Error(`A valid runner for step ${stepId} does not exist.`)
        }

        // Register progress emitter for step
        step.progress = (progress: number) => emitEvent("step:progress", { progress, step, stage, pipeline });
        // Register message emitter for step
        step.message = (message: string) => emitEvent("step:message", { message, step, stage, pipeline });
        // Register write emitter for step
        step.write = (key: string, value: any) => step.outputs[key] = value;

        // Build executor
        const executor = async () => {
            emitEvent("step:started", { step, stage, pipeline });
            await runner.steps?.[stepId]?.(step);
        };

        // Execute and catch errors
        await executor().then(() => {
            // Complete event
            emitEvent("step:completed", { step, stage, pipeline });
        }).catch((error: Error) => {
            // Failed event
            emitEvent("step:failed", { error, step, stage, pipeline });
            throw error;
        });

        // Write step output to stage outputs
        stage.outputs[stepId] = step.outputs ?? {};
    }
}

async function emitEvent(name: EventName, args: { [key: string]: any }) {
    workerEmit({
        name,
        ...args
    });
}

// Create a worker and register public functions
workerpool.worker({
    default: executePipeline
});