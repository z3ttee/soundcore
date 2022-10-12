import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Mount } from "../../mount/entities/mount.entity";
import { Song } from "../../song/entities/song.entity";

export enum FileFlag {
    OK = 0,
    PENDING_ANALYSIS = 1,
    DUPLICATE = 2
}

@Entity()
@Index("UQ-files-on-mount", ["pathHash", "mount"], { unique: true })
export class File {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false, length: 256, type: "varchar" })
    public name: string;

    @Column({ type: "varchar", length: 4097, collation: "utf8mb4_0900_as_ci" })
    public directory: string;

    @Column({ nullable: false })
    public pathHash: string;

    @Column({ nullable: false, default: 0 })
    public size: number;

    @Column()
    public mimetype: string;

    @Column({ type: "tinyint", nullable: false, default: 1 })
    public flag: FileFlag

    @OneToOne(() => Song, { onDelete: "SET NULL" })
    @JoinColumn()
    public song: Song;

    @ManyToOne(() => Mount, { onDelete: "CASCADE", nullable: false })
    public mount: Mount;

}