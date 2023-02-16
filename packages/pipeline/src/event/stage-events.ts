import { PipelineRun } from "../entities/pipeline.entity"
import { IStage } from "../entities/stage.entity";

export interface StageEventParams {
    pipeline: PipelineRun;
    stage: IStage;
}

type StageStartedEventHandler = (params: StageEventParams) => Promise<void> | void;
type StageCompletedEventHandler = (params: StageEventParams) => Promise<void> | void;
type StageFailedEventHandler = (error: Error, params: StageEventParams) => Promise<void> | void;
type StageSkippedEventHandler = (reason: string, params: StageEventParams) => Promise<void> | void;

export type StageEventNames = "stage:started" | "stage:completed" | "stage:failed" | "stage:skipped"
export type StageEventHandler<T extends StageEventNames> = 
    T extends "stage:started" ? StageStartedEventHandler :
    T extends "stage:completed" ? StageCompletedEventHandler :
    T extends "stage:failed" ? StageFailedEventHandler :
    T extends "stage:skipped" ? StageSkippedEventHandler : never;