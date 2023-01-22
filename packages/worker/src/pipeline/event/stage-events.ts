import { Pipeline, Stage } from "../entities/pipeline.entity"

type StageStartedEventHandler = (stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StageCompletedEventHandler = (stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StageFailedEventHandler = (error: Error, stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StageUpdateEventHandler = (progress: number, stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StageMessageEventHandler = (message: string, stage: Stage, pipeline: Pipeline) => Promise<void> | void;

export type StageEventNames = "stage:started" | "stage:completed" | "stage:failed" | "stage:progress" | "stage:message"
export type StageEventHandler<T extends StageEventNames> = 
    T extends "stage:started" ? StageStartedEventHandler :
    T extends "stage:completed" ? StageCompletedEventHandler :
    T extends "stage:failed" ? StageFailedEventHandler :
    T extends "stage:progress" ? StageUpdateEventHandler :
    T extends "stage:message" ? StageMessageEventHandler : never;