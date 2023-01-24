import { Pipeline } from "../entities/pipeline.entity"

// TODO: Add output event, everytime output was written

export type PipelineStartedEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineCompletedEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineFailedEventHandler = (error: Error, pipeline: Pipeline) => Promise<void> | void;
export type PipelineProgressEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineMessageEventHandler = (message: string, pipeline: Pipeline) => Promise<void> | void;

export type PipelineEventNames = "pipeline:started" | "pipeline:completed" | "pipeline:failed" | "pipeline:progress" | "pipeline:message"
export type PipelineEventHandler<T extends PipelineEventNames> = 
    T extends "pipeline:started" ? PipelineStartedEventHandler :
    T extends "pipeline:completed" ? PipelineCompletedEventHandler :
    T extends "pipeline:failed" ? PipelineFailedEventHandler :
    T extends "pipeline:progress" ? PipelineProgressEventHandler :
    T extends "pipeline:message" ? PipelineMessageEventHandler : never;