import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Bucket } from "../../bucket/entities/bucket.entity";
import { File } from "../../file/entities/file.entity";

export enum MountStatus {
    UP = 0,
    ENQUEUED = 1,
    SCANNING = 2,
    INDEXING = 3
}

@Entity()
@Index(["name", "directory", "bucket"], { unique: true })
export class Mount {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 32 })
    public name: string;

    @Column({ nullable: false, type: "text" })
    public directory: string;

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

    @ManyToOne(() => Bucket, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public bucket: Bucket;

    @OneToMany(() => File, (i) => i.mount)
    public files: File[];

    // Below fields may only be populated
    // after custom database queries.
    public filesCount?: number;

    @Column({ select: false, nullable: true, type: "bigint" })
    public usedSpace?: number;

}