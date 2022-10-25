import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Mount } from "../../mount/entities/mount.entity";
import { Song } from "../../song/entities/song.entity";

export enum FileFlag {
    PENDING_ANALYSIS = 0,
    OK = 1,
    POTENTIAL_DUPLICATE = 2
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

    @Column()
    public mimetype: string;

    @Column({ type: "tinyint", nullable: false, default: 0 })
    public flag: FileFlag

    @OneToOne(() => Song, { onDelete: "SET NULL" })
    @JoinColumn()
    public song: Song;

    @ManyToOne(() => Mount, { onDelete: "CASCADE", nullable: false })
    public mount: Mount;

}