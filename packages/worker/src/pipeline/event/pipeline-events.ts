import { PipelineRun } from "../entities/pipeline.entity"

export type PipelineStartedEventHandler = (pipeline: PipelineRun) => Promise<void> | void;
export type PipelineCompletedEventHandler = (pipeline: PipelineRun) => Promise<void> | void;
export type PipelineFailedEventHandler = (error: Error, pipeline: PipelineRun) => Promise<void> | void;
export type PipelineStatusEventHandler = (pipeline: PipelineRun) => Promise<void> | void;
export type PipelineMessageEventHandler = (message: string, pipeline: PipelineRun) => Promise<void> | void;

export type PipelineEventNames = "pipeline:started" | "pipeline:completed" | "pipeline:failed" | "pipeline:status" | "pipeline:message"
export type PipelineEventHandler<T extends PipelineEventNames> = 
    T extends "pipeline:started" ? PipelineStartedEventHandler :
    T extends "pipeline:completed" ? PipelineCompletedEventHandler :
    T extends "pipeline:failed" ? PipelineFailedEventHandler :
    T extends "pipeline:status" ? PipelineStatusEventHandler :
    T extends "pipeline:message" ? PipelineMessageEventHandler : never;