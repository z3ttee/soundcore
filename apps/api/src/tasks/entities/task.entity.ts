import { Environment, IPipeline, PipelineRun, RunStatus, Stage } from "@repo/pipelines";
import { IStage } from "@repo/pipelines/dist/entities/stage.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class TaskDefinition implements IPipeline {
    id: string;
    name: string;
    description: string;
    stages: IStage[];
    scriptFile: string;
}

@Entity()
export class Task implements PipelineRun {
    @PrimaryGeneratedColumn("uuid")
    public readonly runId: string;

    @Column({ type: "varchar", length: 36 })
    public id: string;

    @Column()
    public name: string;

    @Column({ nullable: true })
    public description: string;

    @Column({ nullable: true })
    public currentStageId: string;

    @Column({ nullable: false })
    public status: RunStatus;

    @Column({ type: "json", nullable: true })
    public environment: Environment;

    @Column({ type: "json" })
    public stages: Stage[];

    @CreateDateColumn()
    public createdAt: number;

    @UpdateDateColumn()
    public updatedAt: number;

}