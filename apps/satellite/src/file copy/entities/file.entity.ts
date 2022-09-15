import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Mount } from "../../mount/entities/mount.entity";
import { Song } from "../../song/entities/song.entity";

export enum FileFlag {
    OK = 0,
    CORRUPT = 1,
    DELETED = 2,
    PROCESSING = 3,
    FAILED_SONG_CREATION = 4,
    DUPLICATE = 5
}

@Entity()
export class File {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Index({ unique: false })
    @Column()
    public name: string;

    @Index({ unique: false })
    @Column({ length: 255, collation: "utf8mb4_0900_as_ci" })
    public directory: string;

    @Column({ nullable: true, default: 0 })
    public size: number;

    @Column({ type: "tinyint", nullable: true, default: 0 })
    public flag: FileFlag

    @OneToOne(() => Song, { onDelete: "SET NULL" })
    @JoinColumn()
    public song: Song;

    @ManyToOne(() => Mount)
    public mount: Mount;

}