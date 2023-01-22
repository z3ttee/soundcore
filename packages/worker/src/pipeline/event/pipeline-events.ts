import { Pipeline } from "../entities/pipeline.entity"

export type PipelineStartedEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineCompletedEventHandler = (pipeline: Pipeline) => Promise<void> | void;
export type PipelineFailedEventHandler = (error: Error, pipeline: Pipeline) => Promise<void> | void;
export type PipelineUpdateEventHandler = (progress: number, pipeline: Pipeline) => Promise<void> | void;
export type PipelineMessageEventHandler = (message: string, pipeline: Pipeline) => Promise<void> | void;

export type PipelineEventNames = "pipeline:started" | "pipeline:completed" | "pipeline:failed" | "pipeline:progress" | "pipeline:message"
export type PipelineEventHandler<T extends PipelineEventNames> = 
    T extends "pipeline:started" ? PipelineStartedEventHandler :
    T extends "pipeline:completed" ? PipelineCompletedEventHandler :
    T extends "pipeline:failed" ? PipelineFailedEventHandler :
    T extends "pipeline:progress" ? PipelineUpdateEventHandler :
    T extends "pipeline:message" ? PipelineMessageEventHandler : never;