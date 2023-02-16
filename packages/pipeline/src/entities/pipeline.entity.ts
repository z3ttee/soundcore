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

@Entity()
export class PipelineRun implements Omit<IPipeline, "scriptFile"> {

    @PrimaryGeneratedColumn("uuid")
    public readonly runId: string;

    @Column({ nullable: false })
    public id: string;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: true })
    public description: string;

    @Column({ type: "varchar", nullable: false })
    public status: RunStatus;

    @Column({ type: "json", nullable: true })
    public environment: Environment;

    @Column({ type: "json", nullable: false })
    public stages: IStage[];

    @Column({ type: "json", nullable: true })
    public currentStage: IStage;

    @CreateDateColumn()
    public createdAt: number;

    public outputs: Outputs = {};

}