import winston from "winston";
import path from "node:path";
import workerpool, { workerEmit } from "workerpool";
import { Pipeline, Stage, StageExecutor, StageRunner, Step } from "../entities/pipeline.entity";
import { EventName } from "../event/event";
import { createLogger } from "../logging/logger";
import { PipelineModuleOptions } from "../pipeline.module";

async function executePipeline(pipeline: Pipeline, options: PipelineModuleOptions): Promise<Pipeline> {
    const logger = options.disableLogging ? null : createLogger(pipeline.id, pipeline.runId);
    emitEvent("pipeline:started", { pipeline }, logger);
    if(logger) logger.info(`Using additional environment: `, pipeline.environment ?? {});

    // For loop through stages
    for(const stage of pipeline.stages) {
        const stageId = stage.id;

        // Register progress emitter for stage
        stage.progress = (progress: number) => emitEvent("stage:progress", { progress, stage, pipeline }, logger);
        // Register message emitter for stage
        stage.message = (message: string) => emitEvent("stage:message", { message, stage, pipeline }, logger);
        // Register write emitter for stage
        stage.write = (key: string, value: any) => stage.outputs[key] = value;

        // Initialize outputs for stage
        await executeStage(pipeline, stage, logger).then(() => {
            emitEvent("stage:completed", { stage, pipeline }, logger);
        }).catch((error: Error) => {
            emitEvent("stage:failed", { error, stage, pipeline }, logger);
            throw error;
        });

        // Write outputs to stage id in pipeline
        // outputs
        pipeline.outputs[stageId] = stage.outputs;
    }

    return pipeline;
}

async function executeStage(pipeline: Pipeline, stage: Stage, logger?: winston.Logger) {
    emitEvent("stage:started", { stage, pipeline }, logger);

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
        step.progress = (progress: number) => emitEvent("step:progress", { progress, step, stage, pipeline }, logger);
        // Register message emitter for step
        step.message = (message: string) => emitEvent("step:message", { message, step, stage, pipeline }, logger);
        // Register write emitter for step
        step.write = (key: string, value: any) => step.outputs[key] = value;

        // Build executor
        const executor = async () => {
            emitEvent("step:started", { step, stage, pipeline }, logger);
            await runner.steps?.[stepId]?.(step, logger);
        };

        // Execute and catch errors
        await executor().then(() => {
            // Write step output to stage outputs
            stage.outputs[stepId] = step.outputs ?? {};

            if(logger) logger?.info(`Outputted data by step '${stepId}': `, stage.outputs[stepId]);

            // Complete event
            emitEvent("step:completed", { step, stage, pipeline }, logger);
        }).catch((error: Error) => {
            // Failed event
            emitEvent("step:failed", { error, step, stage, pipeline }, logger);
            throw error;
        });

        
    }
}

async function emitEvent(name: EventName, args: { [key: string]: any }, logger?: winston.Logger) {
    if(logger) logEvent(logger, name, args);

    workerEmit({
        name,
        ...args
    });
}

async function logEvent(logger: winston.Logger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const prefix = name.split(":")[0];

    if(prefix == "pipeline") {
        logPipelineEvents(logger, name, args);
    } else if(prefix == "stage") {
        logStageEvents(logger, name, args);
    } else if(prefix == "step") {
        logStepEvents(logger, name, args);
    }
}

async function logPipelineEvents(logger: winston.Logger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const pipeline: Pipeline = args["pipeline"];
    const progress: number = args["progress"];
    const message: string = args["message"];
    const error: Error = args["error"];

    if(name == "pipeline:started") {
        logger.info(`Pipeline '${pipeline?.id}' started`);
        return;
    } else if(name == "pipeline:progress") {
        logger.info(`Pipeline '${pipeline?.id}' posted progress updated: ${progress}`);
        return;
    } else if(name == "pipeline:message") {
        logger.info(`Pipeline '${pipeline?.id}' published a message: ${message}`);
        return;
    } else if(name == "pipeline:completed") {
        logger.info(`Pipeline '${pipeline?.id}' completed`);
        return;
    } else if(name == "pipeline:failed") {
        logger.error(`Pipeline '${pipeline?.id}' failed: ${error.message}`, error.stack);
        return;
    }
}

async function logStageEvents(logger: winston.Logger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const stage: Stage = args["stage"];
    const progress: number = args["progress"];
    const message: string = args["message"];
    const error: Error = args["error"];

    if(name == "stage:started") {
        logger.info(`Stage '${stage?.id}' started`);
        return;
    } else if(name == "stage:progress") {
        logger.info(`Stage '${stage?.id}' posted progress updated: ${progress}`);
        return;
    } else if(name == "stage:message") {
        logger.info(`Stage '${stage?.id}' published a message: ${message}`);
        return;
    } else if(name == "stage:completed") {
        logger.info(`Stage '${stage?.id}' completed`);
        return;
    } else if(name == "stage:failed") {
        logger.error(`Stage '${stage?.id}' failed: ${error.message}`, error.stack);
        return;
    }
}

async function logStepEvents(logger: winston.Logger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const step: Step = args["step"];
    const progress: number = args["progress"];
    const message: string = args["message"];
    const error: Error = args["error"];

    if(name == "step:started") {
        logger.info(`Step '${step?.id}' started`);
        return;
    } else if(name == "step:progress") {
        logger.info(`Step '${step?.id}' posted progress updated: ${progress}`);
        return;
    } else if(name == "step:message") {
        logger.info(`Step '${step?.id}' published a message: ${message}`);
        return;
    } else if(name == "step:completed") {
        logger.info(`Step '${step?.id}' completed`);
        return;
    } else if(name == "step:failed") {
        logger.error(`Step '${step?.id}' failed: ${error.message}`, error.stack);
        return;
    }
}

// Create a worker and register public functions
workerpool.worker({
    default: executePipeline
});