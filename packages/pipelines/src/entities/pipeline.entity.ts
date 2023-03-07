import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Environment, Outputs, RunStatus } from "./common.entity";
import { IStage, Stage } from "./stage.entity";

/**
 * Interface used for 
 * step definitions
 */
export interface IPipeline {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly stages: IStage[];
    readonly scriptFile: string;
}  

export class Pipeline<E = Environment, O = Outputs> implements Omit<IPipeline, "scriptFile"> {
    public readonly outputs: O = {} as O;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly stages: Stage[],
        public readonly environment: E = {} as E
    ) {}
}

export class PipelineRef implements Omit<IPipeline, "stages" | "scriptFile"> {

    constructor(
        public readonly id: string,
        public readonly runId: string,
        public readonly name: string,
        public readonly description: string
    ) {}
    
}

export interface PipelineRun extends Omit<IPipeline, "scriptFile"> {
    readonly runId: string;
    status: RunStatus;
    environment: Environment;
    stages: Stage[];
    currentStageId: string;
}

export interface PipelineWorkerResult {
    pipeline: PipelineRun;
    outputs: Outputs;
    sharedOutputs: Outputs;
}

export type PipelineEntityResolver = (pipeline: PipelineRun) => PipelineRun | Promise<PipelineRun>;
export interface PipelineEventParams {
    pipeline: PipelineRun
}