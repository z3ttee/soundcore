import { PipelineRun } from "../entities/pipeline.entity"
import { IStage } from "../entities/stage.entity";
import { IStep } from "../entities/step.entity";

export interface StepEventParams {
    pipeline: PipelineRun;
    stage: IStage;
    step: IStep;
}

type StepStartedEventHandler = (params: StepEventParams) => Promise<void> | void;
type StepCompletedEventHandler = (params: StepEventParams) => Promise<void> | void;
type StepFailedEventHandler = (error: Error, params: StepEventParams) => Promise<void> | void;
type StepProgressEventHandler = (progress: number, params: StepEventParams) => Promise<void> | void;
type StepSkippedEventHandler = (reason: string, params: StepEventParams) => Promise<void> | void;
type StepAbortedEventHandler = (error: Error, params: StepEventParams) => Promise<void> | void;
type StepMessageEventHandler = (message: string, params: StepEventParams) => Promise<void> | void;

export type StepEventNames = "step:started" | "step:completed" | "step:failed" | "step:progress" | "step:message" | "step:skipped" | "step:aborted"
export type StepEventHandler<T extends StepEventNames> = 
    T extends "step:started" ? StepStartedEventHandler :
    T extends "step:completed" ? StepCompletedEventHandler :
    T extends "step:failed" ? StepFailedEventHandler :
    T extends "step:progress" ? StepProgressEventHandler :
    T extends "step:aborted" ? StepAbortedEventHandler :     
    T extends "step:skipped" ? StepSkippedEventHandler : 
    T extends "step:message" ? StepMessageEventHandler : never;
