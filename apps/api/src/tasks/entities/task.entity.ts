import { Environment, PipelineRun, RunStatus, Stage } from "@soundcore/pipelines";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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