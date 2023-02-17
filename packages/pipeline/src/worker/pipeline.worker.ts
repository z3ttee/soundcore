import path from "node:path";
import { worker } from "workerpool";
import { StageConfigurator, StageInitializer } from "../builder/stage.builder";
import { Outputs, Resources, RunStatus } from "../entities/common.entity";
import { IPipeline, PipelineRun } from "../entities/pipeline.entity";
import { StepConditionEvaluator, StepExecutor, StepRef } from "../entities/step.entity";
import { PipelineAbortedException } from "../exceptions/abortedException";
import { StepSkippedException } from "../exceptions/skippedException";
import { createLogger } from "../logging/logger";
import { PipelineGlobalOptions } from "../pipelines.module";
import { readConfiguratorFromFile } from "../utils/registerPipelines";
import { emit, getOrDefault, globalThis } from "../utils/workerHelperFunctions";

worker({
    default: async (pipeline: PipelineRun, definition: IPipeline, globalOptions: PipelineGlobalOptions) => {
        // Instantiate logger
        const logger = createLogger(pipeline.id, pipeline.runId, globalOptions.enableStdout ?? false, true);
        logger.info(`Worker picked up pipeline run. Preparing...`);

        // Update pipeline status
        pipeline.status = RunStatus.WORKING;
        emit("status", { pipeline });

        // Initialize global variables for helper functions
        globalThis.pipeline = pipeline;
        globalThis.definition = definition;

        // Extract pipeline script configuration from file
        const pipelineConfigurator = readConfiguratorFromFile(path.resolve(definition.scriptFile));
        // Extract stage initializers pipeline script
        const stageConfigurators: Map<string, StageConfigurator> = new Map();
        const stageInitializers: Map<string, StageInitializer> = new Map();
        for(const stageConfigurator of pipelineConfigurator["_stages"]) {
            stageConfigurators.set(stageConfigurator["_id"], stageConfigurator);
            if(typeof stageConfigurator["_initializer"] === "function") stageInitializers.set(stageConfigurator["_id"], stageConfigurator["_initializer"]);
        }

        // Execute all stages
        for(const stage of pipeline.stages) {
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

            // Check if there are any executors registered, otherwise skip stage
            if(stepExecutors.size <= 0) {
                logger.warn(`Stage '${stage.id}' has no steps. Skipping...`);
                continue;
            }

            // Instantiate default resources and execute
            // optional initializer to build resources object
            let resources: Resources = {};
            if(stageInitializers.has(stage.id)) {
                const initializer: StageInitializer = stageInitializers.get(stage.id);
                // Validate initializer function
                if(typeof initializer !== "function") {
                    const error = new Error(`Invalid initializer function on stage '${stage.id}'`);
                    logger.error(`Failed initializing stage: ${error.message}`, error.stack);
                    throw error;
                }

                // Execute initializer
                resources = await initializer().then((val) => val ?? {}).catch((error: Error) => {
                    logger.error(`Failed initializing stage: ${error.message}`, error.stack);
                    throw error;
                });
            }

            try {
                // Update pipeline status
                pipeline.currentStageId = stage.id;
                stage.status = RunStatus.WORKING;
                emit("status", { pipeline });

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
                            const conditionEvaluator = async (prevOutput: Outputs) => await stepCondEvaluators.get(step.id)(prevOutput);
                            const outputs = !!prevStep ? getOrDefault(`${stage.id}.${prevStep.id}`, {}) : {};
                            await conditionEvaluator(outputs).catch((error: Error) => {
                                logger.warn(`Could not evaluate condition for step '${step.id}': ${error.message}`);
                                throw new StepSkippedException(`Could not evaluate condition: ${error.message}`);
                            }).then((canContinue) => {
                                if(!canContinue) {
                                    step.status = RunStatus.SKIPPED;
                                    throw new StepSkippedException(`Skipped because condition was not met. Received 'false'`);
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
                            throw new StepSkippedException(reason);
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
                            step.progress = 100;
                            emit("status", { pipeline });
                        })
                    } catch (error) {
                        if(error instanceof StepSkippedException) {
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
                    pipeline.status = RunStatus.ABORTED;
                    stage.status = RunStatus.ABORTED;
                    logger.error(`Pipeline aborted by step '${error.issuer.id}': ${error.message}`);
                    emit("status", { pipeline });
                    throw new Error(`Pipeline aborted by step '${error.issuer.id}': ${error.message}`);
                }

                pipeline.status = RunStatus.FAILED;
                stage.status = stage.status != RunStatus.WORKING ? stage.status : RunStatus.FAILED;
                logger.error(`Step execution failed: ${error?.message}`, error?.stack)
                emit("status", { pipeline });

                // Unresolvable error was thrown, that breaks the flow of the pipeline, abort the execution of the pipeline
                // For that, break the stage for-loop to end the pipeline run.
                throw error;
            }
        }

        // Emit completion
        pipeline.status = RunStatus.COMPLETED;
        pipeline.currentStageId = null;
        emit("status", { pipeline });

        return pipeline;
    }
});

