import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Bucket } from "../../bucket/entities/bucket.entity";
import { File } from "../../file/entities/file.entity";
import { MountStatus } from "../enums/mount-status.enum";

@Entity()
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

    @ManyToOne(() => Bucket, { onDelete: "CASCADE" })
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