import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Zone } from "../../zone/entities/zone.entity";
import { MOUNTNAME_MAX_LENGTH } from "../../constants";
import { File } from "../../file/entities/file.entity";

export enum MountStatus {
    UP = 0,
    ENQUEUED = 1,
    BUSY = 2,
    ERRORED = 3
}

export interface MountProgressInfo {
    title: string;
    description: string;
}

export interface MountProgress {
    /**
     * Id of the mount
     */
    mountId: string;

    /**
     * Number of the current step
     */
    currentStep: number;

    /**
     * Max number of steps of
     * this process
     */
    maxSteps: number;

    /**
     * Progress in %
     * Set to -1, if progress cannot be calculated (indeterminate)
     */
    progress?: number;

    /**
     * Define title and description
     * of the current step
     */
    info: MountProgressInfo;
}

@Entity()
@Index(["directory", "zone"], { unique: true })
export class Mount {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: MOUNTNAME_MAX_LENGTH, nullable: false })
    public name: string;

    @Column({ length: 4, nullable: false, unique: true })
    public discriminator: string;

    @Column({ nullable: false, type: "text" })
    public directory: string;

    @Column({ type: "json", nullable: true })
    public progressInfo: MountProgress;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column({ type: "datetime", nullable: true })
    public lastScannedAt: Date;

    @Column({ type: "tinyint", nullable: false, default: 0 })
    public status: MountStatus;

    @Column({ default: false })
    public isDefault: boolean;

    @ManyToOne(() => Zone, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public zone: Zone;

    @OneToMany(() => File, (i) => i.mount)
    public files: File[];

    // Below fields may only be populated
    // after custom database queries.
    public filesCount?: number;

    @Column({ select: false, nullable: true, type: "bigint" })
    public usedSpace?: number;

}