import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Mount } from "../../mount/entities/mount.entity";
import { Song } from "../../song/entities/song.entity";

export enum FileFlag {
    PENDING_ANALYSIS = 0,
    OK = 1,
    POTENTIAL_DUPLICATE = 2,
    ERROR = 3,
    INVALID_PATH_ENCODING = 4
}

export interface FileID {
    id: string;
}

@Entity()
@Index("UQ-files-on-mount", ["pathHash", "mount"], { unique: true })
export class File {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false, length: 256, type: "varchar" })
    public name: string;

    @Column({ type: "varchar", length: 4097 })
    public directory: string;

    @Column({ nullable: false })
    public pathHash: string;

    @Column({ nullable: false, default: 0 })
    public size: number;

    @Column({ nullable: true })
    public mimetype: string;

    @Column({ type: "enum",  enum: FileFlag, nullable: false, default: FileFlag.PENDING_ANALYSIS })
    public flag: FileFlag

    @OneToOne(() => Song, (song) => song.file, { onDelete: "SET NULL" })
    public song: Song;

    @ManyToOne(() => Mount, { onDelete: "CASCADE", nullable: false })
    public mount: Mount;

    @CreateDateColumn()
    public createdAt: number;

    @UpdateDateColumn()
    public updatedAt: number;
}