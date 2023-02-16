import workerpool, { workerEmit } from "workerpool";
import { Pipeline, PipelineRef, PipelineRun, PipelineStatus } from "../entities/pipeline.entity";
import { EventName } from "../event/event";
import { createLogger, PipelineLogger } from "../logging/logger";
import { createPipelineFromBuilder, PipelineModuleOptions, readFromScript } from "../pipeline.module";
import { Stage, StageBuilder, StageInitializer, StageRef, StageResources } from "../entities/stage.entity";
import { Step, StepRef, StepRunner } from "../entities/step.entity";
import { SkippedException } from "../exceptions/skipped.exception";
import { AbortException } from "../exceptions/abort.exception";

async function emitEvent(name: EventName, args: { [key: string]: any }, logger: PipelineLogger) {
    if(logger) logEvent(logger, name, args);

    workerEmit({
        name,
        ...args
    });
}

async function logEvent(logger: PipelineLogger, name: EventName, args: { [key: string]: any }) {
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

async function logPipelineEvents(logger: PipelineLogger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const pipeline: Pipeline = args["pipeline"];
    const message: string = args["message"];
    const error: Error = args["error"];

    if(name == "pipeline:started") {
        logger.info(`Pipeline '${pipeline?.id}' started`);
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

async function logStageEvents(logger: PipelineLogger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const stage: Stage = args["stage"];
    const progress: number = args["progress"];
    const message: string = args["message"];
    const error: Error = args["error"];
    const reason: string = args["reason"];

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
    } else if(name == "stage:skipped") {
        logger.warn(`Stage '${stage?.id}' skipped: ${reason}`);
        return;
    }
}

async function logStepEvents(logger: PipelineLogger, name: EventName, args: { [key: string]: any }) {
    if(!logger) return;
    const step: Step = args["step"];
    const progress: number = args["progress"];
    const message: string = args["message"];
    const error: Error = args["error"];
    const reason: string = args["reason"];

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
    } else if(name == "step:skipped") {
        logger.warn(`Step '${step?.id}' skipped: ${reason}`);
        return;
    }
}

// Create a worker and register public functions
workerpool.worker({
    default: async (pipeline: PipelineRun, options: PipelineModuleOptions) => {
        // Initialize logger
        const logger = createLogger(pipeline.id, pipeline.runId, options.logging?.enableConsoleLogging ?? false, options.logging?.enableFileLogging ?? true);

        const [builder, pipelineOptions] = readFromScript(pipeline.script);
        
        const stageResources: Map<string, StageInitializer> = new Map();
        builder["_stages"].forEach((stage) => {
            stageResources.set(stage["id"], stage["_initializer"]);
        });

        const stageBuilders = builder["_stages"];

        // Emit pipeline status
        pipeline.status = PipelineStatus.WORKING;
        emitEvent("pipeline:started", { pipeline }, logger);

        // Log used env variables
        logger.info(`Using additional environment: `, pipeline.environment ?? {});

        // Create pipeline ref
        const pipelineRef: PipelineRef = new PipelineRef(
            pipeline.id,
            pipeline.runId,
            pipeline.name,
            // Read outputs
            (key: string) => pipeline.outputs[key],
            // Skip
            (reason: string) => { throw new SkippedException(reason) },
            // Message
            (...args: any[]) => emitEvent("pipeline:message", { ...args }, logger),
            pipeline.environment
        );

        // For loop through stages
        for(const stage of pipeline.stages) {

            // Update pipeline status
            pipeline.status = PipelineStatus.WORKING;
            pipeline.currentStage = stage;

            // Initialize stage
            let resources: StageResources = {};
            if(stageResources.has(stage.id)) {
                resources = await stageResources.get(stage.id)();
            }
            
            await executeStage(pipelineRef, stage, resources, stageBuilders, logger).then(() => {
                // Stage completed
                stage.status = PipelineStatus.COMPLETED;
                stage.currentStep = null;

                emitEvent("stage:completed", { stage, pipeline }, logger);
                emitEvent("pipeline:status", { pipeline }, logger);
            }).catch((error: Error) => {
                // Stage failed 
                if(error instanceof SkippedException || error instanceof AbortException) {
                    stage.status = PipelineStatus.SKIPPED;
                    stage.skipReason = error.reason;

                    emitEvent("stage:skipped", { reason: error.reason, stage, pipeline }, logger);
                    emitEvent("pipeline:status", { pipeline }, logger);   
                    
                    // Propagate error to pipeline
                    if(error instanceof AbortException) {
                        throw new AbortException(error.reason);
                    }
                } else {
                    emitEvent("stage:failed", { error, stage, pipeline }, logger);
                    emitEvent("pipeline:status", { pipeline }, logger);      
                    throw error;
                }
            });

            // Write outputs to stage id in pipeline
            // outputs
            pipeline.outputs[stage.id] = stage.outputs;
        }

        return pipeline;
    }
});

/**
 * Execute the given stage.
 * @param pipeline Pipeline information
 * @param stage Stage to execute
 * @param logger Logger instance
 */
async function executeStage(pipeline: PipelineRef, stage: Stage, resources: StageResources, stageBuilders: StageBuilder[], logger: PipelineLogger) {
    // Update stage
    stage.status = PipelineStatus.WORKING;
    emitEvent("stage:started", { stage, pipeline }, logger);
    emitEvent("pipeline:status", { pipeline }, logger);

    // Create the ref with helper functions
    const stageRef: StageRef = new StageRef(
        stage.id, 
        stage.name,
        resources,
        // Emit custom message
        (message: string) => emitEvent("stage:message", { message, stage, pipeline }, logger),
        // Read from outputs
        (key: string) => stage.outputs[key],
        // Skip function
        (reason: string) => { throw new SkippedException(reason) },
    );

    const stepRunners: Map<string, StepRunner> = new Map();
    stageBuilders.find((stageBuilder) => stageBuilder["id"] === stage.id)?.["_steps"].forEach((stepsBuilder) => {
        stepRunners.set(stepsBuilder["id"], stepsBuilder["_runner"]);
    })

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
                emitEvent("pipeline:status", { pipeline }, logger);
            },
            // Emit custom message
            (message: string) => emitEvent("step:message", { message, step, stage, pipeline }, logger),
            // Write to output
            (key: string, value: any) => step.outputs[key] = value,
            // Read from output
            (key: string) => step.outputs[key],
            // Skip function
            (reason: string) => { throw new SkippedException(reason) },
            (reason: string) => { throw new AbortException(reason) },
        );
        const stepId = stepRef.id;

        if(!stepRunners.has(stepId)) {
            throw new SkippedException(`Invalid runner for step '${stepId}'`);
        }

        // Build executor
        const executor = async () => {
            // Update step status
            step.status = PipelineStatus.WORKING;
            emitEvent("step:started", { step, stage, pipeline }, logger);
            // Emit pipeline status
            emitEvent("pipeline:status", { pipeline }, logger);

            const runner = stepRunners.get(stepId);
            return await runner({ step: stepRef, stage: stageRef, pipeline: pipeline, environment: pipeline.environment ?? {}, logger: logger });
        };

        // Execute and catch errors
        await executor().then(() => {
            // Step completed
            step.status = PipelineStatus.COMPLETED;
            step.progress = 0;

            // Write step output to stage outputs
            stage.outputs[stepId] = step.outputs ?? {};

            emitEvent("step:completed", { step, stage, pipeline }, logger);
            emitEvent("pipeline:status", { pipeline }, logger);
        }).catch((error: Error) => {
            // Reset progress
            step.progress = 0;

            // Check if error is skipped exception
            if(error instanceof SkippedException || error instanceof AbortException) {
                step.status = PipelineStatus.SKIPPED;
                step.skipReason = error.reason;
                emitEvent("step:skipped", { reason: error.reason, step, stage, pipeline }, logger);
                emitEvent("pipeline:status", { pipeline }, logger);

                // Propagate error to stage
                if(error instanceof AbortException) {
                    throw new AbortException(error.reason);
                }
            } else {
                step.status = PipelineStatus.FAILED;
                emitEvent("step:failed", { error, step, stage, pipeline }, logger);
                emitEvent("pipeline:status", { pipeline }, logger);
                throw error;
            }
            
        });
    }
}