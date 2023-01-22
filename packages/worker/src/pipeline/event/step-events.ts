import { Pipeline, Stage, Step } from "../entities/pipeline.entity"

type StepStartedEventHandler = (step: Step, stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StepCompletedEventHandler = (step: Step, stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StepFailedEventHandler = (error: Error, step: Step, stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StepUpdateEventHandler = (progress: number, step: Step, stage: Stage, pipeline: Pipeline) => Promise<void> | void;
type StepMessageEventHandler = (step: Step, stage: Stage, pipeline: Pipeline) => Promise<void> | void;

export type StepEventNames = "step:started" | "step:completed" | "step:failed" | "step:progress" | "step:message"
export type StepEventHandler<T extends StepEventNames> = 
    T extends "step:started" ? StepStartedEventHandler :
    T extends "step:completed" ? StepCompletedEventHandler :
    T extends "step:failed" ? StepFailedEventHandler :
    T extends "step:progress" ? StepUpdateEventHandler :
    T extends "step:message" ? StepMessageEventHandler : never;