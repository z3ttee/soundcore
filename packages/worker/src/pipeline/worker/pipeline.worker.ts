import winston from "winston";
import path from "node:path";
import workerpool, { workerEmit } from "workerpool";
import { Pipeline, PipelineStatus } from "../entities/pipeline.entity";
import { EventName } from "../event/event";
import { createEmptyLogger, createLogger } from "../logging/logger";
import { PipelineModuleOptions } from "../pipeline.module";
import { Stage, StageExecutor, StageRef, StageRunner } from "../entities/stage.entity";
import { Step, StepRef } from "../entities/step.entity";

async function executePipeline(pipeline: Pipeline, options: PipelineModuleOptions): Promise<Pipeline> {
    // Initialize logger
    const logger = options.disableLogging ? createEmptyLogger() : createLogger(pipeline.id, pipeline.runId);

    // Emit pipeline status
    pipeline.status = PipelineStatus.WORKING;
    emitEvent("pipeline:started", { pipeline }, logger);

    // Log used env variables
    logger.info(`Using additional environment: `, pipeline.environment ?? {});

    // For loop through stages
    for(const stage of pipeline.stages) {

        // Update pipeline status
        pipeline.status = PipelineStatus.WORKING;
        pipeline.currentStage = stage;

        // Initialize outputs for stage
        await executeStage(pipeline, stage, logger).then(() => {
            // Update stage
            stage.status = PipelineStatus.COMPLETED;
            stage.currentStep = null;

            // Emit completion
            emitEvent("stage:completed", { stage, pipeline }, logger);
            // Emit pipeline status update
            emitEvent("pipeline:status", { pipeline });
        }).catch((error: Error) => {
            // Update stage
            stage.status = PipelineStatus.FAILED;

            // Emit failure
            emitEvent("stage:failed", { error, stage, pipeline }, logger);
            // Emit pipeline status update
            emitEvent("pipeline:status", { pipeline });
            throw error;
        });

        // Write outputs to stage id in pipeline
        // outputs
        pipeline.outputs[stage.id] = stage.outputs;
    }

    return pipeline;
}

async function executeStage(pipeline: Pipeline, stage: Stage, logger: winston.Logger) {
    // Update stage
    stage.status = PipelineStatus.WORKING;
    // Emit started event
    emitEvent("stage:started", { stage, pipeline }, logger);
    // Emit pipeline status
    emitEvent("pipeline:status", { pipeline });

    // Create the ref with helper functions
    const stageRef: StageRef = new StageRef(
        stage.id, 
        stage.name,
        // Emit progress
        (progress: number) => emitEvent("stage:progress", { progress, stage, pipeline }, logger),
        // Emit custom message
        (message: string) => emitEvent("stage:message", { message, stage, pipeline }, logger),
        // Write to outputs
        (key: string, value: any) => stage.outputs[key] = value,
        // Read from outputs
        (key: string) => stage.outputs[key]
    );

    // Load script file
    const script = path.resolve(stage.scriptPath);
    const stageExecutor: StageExecutor = require(script)?.default;

    // Execute runner to retrieve steps handler
    const runner: StageRunner = await stageExecutor(stageRef, pipeline.environment).catch((error) => {
        throw error;
    });

    // Execute every step 
    for(const step of stage.steps) {
        // Updated current step on stage
        stage.currentStep = step;

        // Create the ref with helper functions
        const stepRef: StepRef = new StepRef(
            step.id, 
            step.name,
            // Emit progress
            (progress: number) => {
                step.progress = progress ?? 0;
                emitEvent("step:progress", { progress, step, stage, pipeline }, logger);
                // Emit pipeline status
                emitEvent("pipeline:status", { pipeline });
            },
            // Emit custom message
            (message: string) => emitEvent("step:message", { message, step, stage, pipeline }, logger),
            // Write to output
            (key: string, value: any) => step.outputs[key] = value,
            // Read from output
            (key: string) => step.outputs[key],
        );
        const stepId = stepRef.id;

        // Check if runner exists
        if(typeof runner.steps?.[stepId] !== "function") {
            throw new Error(`A valid runner for step ${stepId} does not exist.`)
        }

        // Build executor
        const executor = async () => {
            // Update step status
            step.status = PipelineStatus.WORKING;
            emitEvent("step:started", { step, stage, pipeline }, logger);
            // Emit pipeline status
            emitEvent("pipeline:status", { pipeline });
            await runner.steps?.[stepId]?.(stepRef, logger);
        };

        // Execute and catch errors
        await executor().then(() => {
            // Update step status
            step.status = PipelineStatus.COMPLETED;
            step.progress = 0;

            // Write step output to stage outputs
            stage.outputs[stepId] = step.outputs ?? {};

            // Log outputs
            logger.info(`Outputted data by step '${stepId}': `, stage.outputs[stepId]);

            // Complete event
            emitEvent("step:completed", { step, stage, pipeline }, logger);
            // Emit pipeline status
            emitEvent("pipeline:status", { pipeline });
        }).catch((error: Error) => {
            // Update step status
            step.status = PipelineStatus.FAILED;
            step.progress = 0;
            // Failed event
            emitEvent("step:failed", { error, step, stage, pipeline }, logger);
            // Emit pipeline status
            emitEvent("pipeline:status", { pipeline });
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
    // TODO: Set pipeline status and emit progress
    if(!logger) return;
    const pipeline: Pipeline = args["pipeline"];
    const progress: number = args["progress"];
    const message: string = args["message"];
    const error: Error = args["error"];

    if(name == "pipeline:started") {
        logger.info(`Pipeline '${pipeline?.id}' started`);
        return;
    } else if(name == "pipeline:status") {
        logger.info(`Pipeline '${pipeline?.id}' posted status update.`);
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
    // TODO: Set stage status and emit progress
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