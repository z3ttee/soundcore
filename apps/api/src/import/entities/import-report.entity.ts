import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ImportTask } from "./import.entity";

@Entity()
export class ImportReport<D = any> {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @CreateDateColumn()
    public createdAt: number;

    @OneToOne(() => ImportTask, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public task: ImportTask;

    @Column({ type: "json" })
    public data: D;

}