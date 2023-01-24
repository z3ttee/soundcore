import { Pipeline } from "../entities/pipeline.entity"

// TODO: Add output event, everytime output was written

export type PipelineStartedEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineCompletedEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineFailedEventHandler = (error: Error, pipeline: Pipeline) => Promise<void> | void;
export type PipelineStatusEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineMessageEventHandler = (message: string, pipeline: Pipeline) => Promise<void> | void;

export type PipelineEventNames = "pipeline:started" | "pipeline:completed" | "pipeline:failed" | "pipeline:status" | "pipeline:message"
export type PipelineEventHandler<T extends PipelineEventNames> = 
    T extends "pipeline:started" ? PipelineStartedEventHandler :
    T extends "pipeline:completed" ? PipelineCompletedEventHandler :
    T extends "pipeline:failed" ? PipelineFailedEventHandler :
    T extends "pipeline:status" ? PipelineStatusEventHandler :
    T extends "pipeline:message" ? PipelineMessageEventHandler : never;