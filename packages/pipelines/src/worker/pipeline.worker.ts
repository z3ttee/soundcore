import path from "node:path";
import { worker } from "workerpool";
import { StageConfigurator, StageInitializer } from "../builder/stage.builder";
import { DEFAULT_STATUS_EVENT_DEBOUNCE_MS } from "../constants";
import { Outputs, PipelineLogger, Resources, RunStatus } from "../entities/common.entity";
import { IPipeline, PipelineRun, PipelineWorkerResult } from "../entities/pipeline.entity";
import { StepConditionEvaluator, StepExecutor, StepRef } from "../entities/step.entity";
import { PipelineAbortedException } from "../exceptions/abortedException";
import { SkippedException } from "../exceptions/skippedException";
import { createLogger } from "../logging/logger";
import { PipelineGlobalOptions, PipelineLocalOptions } from "../options";
import { readConfiguratorFromFile } from "../utils/registerPipelines";
import { emit, getOrDefault, globalThis, PipelineGlobal, resetGlobals } from "../utils/workerHelperFunctions";

worker({
    default: async (pipeline: PipelineRun, definition: IPipeline, globalOptions: PipelineGlobalOptions, localOptions: PipelineLocalOptions): Promise<PipelineWorkerResult> => {
        const startedAtMs: number = Date.now();

        // Instantiate logger
        const logger = createLogger(globalOptions.logsDirectory, pipeline.id, pipeline.runId, globalOptions.enableStdout ?? false, globalOptions.disableFileLogs ?? true);
        logger.info(`Worker picked up pipeline run. Preparing...`);

        // Update debounce time
        globalThis.statusEventDebounceMs = localOptions.debounceStatus ?? DEFAULT_STATUS_EVENT_DEBOUNCE_MS;
        // Update logger
        globalThis.logger = logger;

        // Extract pipeline script configuration from file
        const pipelineConfigurator = readConfiguratorFromFile(path.resolve(definition.scriptFile));

        // Resolve pipeline entity
        if(typeof pipelineConfigurator["_resolver"] === "function") {
            const resolver = async () => pipelineConfigurator["_resolver"](pipeline);
            pipeline = await resolver().catch((error: Error) => {
                logger.error(`Could not resolve custom pipeline entity: ${error.message}`, error.stack);
                throw error;
            });
        }

        // Update pipeline status
        pipeline.status = RunStatus.WORKING;
        emit("status", { pipeline });

        // Initialize global variables for helper functions
        globalThis.pipeline = pipeline;
        globalThis.definition = definition;

        // Extract stage initializers pipeline script
        const stageConfigurators: Map<string, StageConfigurator> = new Map();
        for(const stageConfigurator of pipelineConfigurator["_stages"]) {
            stageConfigurators.set(stageConfigurator["_id"], stageConfigurator);
        }

        // Execute all stages
        for(let stageIndex = 0; stageIndex < pipeline.stages.length; stageIndex++) {
            const stage = pipeline.stages[stageIndex];
            const prevStage = stageIndex > 0 ? pipeline.stages[stageIndex - 1] : stage;
            logger.info(`Preparing stage '${stage.id}'...`);

            // Update global object
            globalThis.stage = stage;

            // Extract step executors
            const stageConfigurator = stageConfigurators.get(stage.id)?.["_steps"];
            const stepCondEvaluators: Map<string, StepConditionEvaluator> = new Map();
            const stepExecutors: Map<string, StepExecutor> = new Map();
            for(const stepConfigurator of stageConfigurator) {
                if(typeof stepConfigurator["_conditionEvaluator"] === "function") stepCondEvaluators.set(stepConfigurator["_id"], stepConfigurator["_conditionEvaluator"]);
                if(typeof stepConfigurator["_runner"] === "function") stepExecutors.set(stepConfigurator["_id"], stepConfigurator["_runner"])
            }

            try {
                // Update pipeline status
                pipeline.currentStageId = stage.id;
                stage.status = RunStatus.WORKING;
                emit("status", { pipeline });

                // Check if there are any executors registered, otherwise skip stage
                if(stepExecutors.size <= 0) {
                    logger.warn(`Stage '${stage.id}' has no steps. Skipping...`);
                    continue;
                }

                // Evaluate if stage can run based on condition
                if(typeof stageConfigurators.get(stage.id)?.["_conditionEvaluator"] === "function") {
                    const conditionEvaluator = async (prevOutput: Outputs, shared: Outputs) => await stageConfigurators.get(stage.id)?.["_conditionEvaluator"](prevOutput, shared) ;
                    const outputs = getOrDefault(`${prevStage.id}`, {});

                    // Execute evaluator
                    await conditionEvaluator(outputs, {...globalThis.sharedOutputs}).catch((error: Error) => {
                        logger.warn(`Could not evaluate condition for step '${stage.id}': ${error.message}`);
                        throw new SkippedException(`Could not evaluate condition: ${error.message}`);
                    }).then((canContinue) => {
                        if(!canContinue) {
                            stage.status = RunStatus.SKIPPED;
                            throw new SkippedException(`Skipped because condition was not met. Received 'false'`);
                        }
                    });
                }

                // Instantiate default resources and execute
                // optional initializer to build resources object
                let resources: Resources = {};
                if(typeof stageConfigurators.get(stage.id)?.["_initializer"] === "function") {
                    const initializer: StageInitializer = stageConfigurators.get(stage.id)?.["_initializer"];

                    // Execute initializer
                    resources = await initializer().then((val) => val ?? {}).catch((error: Error) => {
                        logger.error(`Failed initializing stage: ${error.message}`, error.stack);
                        throw error;
                    });
                }

                // Execute steps
                for(let index = 0; index < stage.steps.length; index++) {
                    const step = stage.steps[index];
                    const prevStep = index > 0 ? stage.steps[index - 1] : undefined;

                    // Update current step
                    globalThis.step = step;
                    logger.info(`Preparing step '${step.id}'...`);

                    // Check if the step can be executed
                    if(!stepExecutors.has(step.id) || typeof stepExecutors.get(step.id) !== "function") {
                        throw new Error(`Step '${step.id}' has invalid executor function`);
                    }

                    try {
                        // Update pipeline status
                        stage.currentStepId = step.id;
                        step.status = RunStatus.WORKING;
                        emit("status", { pipeline });

                        // Evaluate condition, if not met, skip the step
                        if(stepCondEvaluators.has(step.id)) {
                            const conditionEvaluator = async (prevOutput: Outputs) => await stepCondEvaluators.get(step.id)(prevOutput, {...globalThis.sharedOutputs});
                            const outputs = !!prevStep ? getOrDefault(`${stage.id}.${prevStep.id}`, {}) : {};
                            await conditionEvaluator(outputs).catch((error: Error) => {
                                logger.warn(`Could not evaluate condition for step '${step.id}': ${error.message}`);
                                throw new SkippedException(`Could not evaluate condition: ${error.message}`);
                            }).then((canContinue) => {
                                if(!canContinue) {
                                    step.status = RunStatus.SKIPPED;
                                    throw new SkippedException(`Skipped because condition was not met. Received 'false'`);
                                }
                            });
                        }

                        // Instantiate step ref functions
                        const abort = (error: string): never => {
                            step.status = RunStatus.ABORTED;
                            throw new PipelineAbortedException(error, step);
                        }

                        const skip = (reason: string): never => {
                            step.status = RunStatus.SKIPPED;
                            throw new SkippedException(reason);
                        }

                        const executor = stepExecutors.get(step.id);
                        await Promise.all([
                            executor({
                                pipeline: definition,
                                environment: pipeline.environment,
                                logger: logger,
                                resources: resources,
                                stage: stage,
                                step: new StepRef(step, abort, skip)
                            })
                        ]).catch((error) => {
                            throw error;
                        }).then(() => {
                            // Update pipeline status
                            stage.currentStepId = step.id;
                            step.status = RunStatus.COMPLETED;
                            step.progress = 1;
                            emit("status", { pipeline });
                        })
                    } catch (error) {
                        if(error instanceof SkippedException) {
                            logger.warn(`Skipped step '${step.id}': ${error.reason}`);
                            step.status = step.status != RunStatus.WORKING ? step.status : RunStatus.SKIPPED;
                            emit("status", { pipeline });
                        } else {
                            step.status = step.status != RunStatus.WORKING ? step.status : RunStatus.FAILED;
                            emit("status", { pipeline });
                            throw error;
                        }
                    }
                }

                // Update pipeline status
                pipeline.currentStageId = stage.id;
                stage.status = RunStatus.COMPLETED;
                stage.currentStepId = null;
                emit("status", { pipeline });
            } catch (error: any) {                
                if(error instanceof PipelineAbortedException) {
                    // Pipeline was aborted
                    pipeline.status = RunStatus.ABORTED;
                    stage.status = RunStatus.ABORTED;
                    logger.error(`Pipeline aborted by step '${error.issuer.id}': ${error.message}`);
                    emit("status", { pipeline });
                    logDurationMs(startedAtMs, logger);
                    throw new Error(`Pipeline aborted by step '${error.issuer.id}': ${error.message}`);
                } else if(error instanceof SkippedException) {
                    // Stage was skipped
                    logger.warn(`Skipped stage '${stage.id}': ${error.reason}`);
                    stage.status = stage.status != RunStatus.WORKING ? stage.status : RunStatus.SKIPPED;
                    emit("status", { pipeline });
                    // Continue with next stage
                    continue;
                }

                pipeline.status = RunStatus.FAILED;
                stage.status = stage.status != RunStatus.WORKING ? stage.status : RunStatus.FAILED;
                logger.error(`Step execution failed: ${error?.message}`, error?.stack)
                emit("status", { pipeline });

                // Unresolvable error was thrown, that breaks the flow of the pipeline, abort the execution of the pipeline
                // For that, break the stage for-loop to end the pipeline run.
                logDurationMs(startedAtMs, logger);
                throw error;
            }
        }

        // Emit completion
        pipeline.status = RunStatus.COMPLETED;
        pipeline.currentStageId = null;
        emit("status", { pipeline });

        logDurationMs(startedAtMs, logger);

        const pipelineResult = {...pipeline};
        const outputsResult = {...globalThis.outputs};
        const sharedResult = {...globalThis.sharedOutputs};

        // Free resources by deleting globalThis and setting it to empty obj
        resetGlobals();

        return {
            pipeline: pipelineResult,
            outputs: outputsResult,
            sharedOutputs: sharedResult
        };
    }
});

function logDurationMs(startedAtMs: number, logger: PipelineLogger) {
    logger.info(`Pipeline ran for ${Date.now() - startedAtMs}ms`);
}

