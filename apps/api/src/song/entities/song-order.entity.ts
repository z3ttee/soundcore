import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Song } from "./song.entity";

@Entity()
export class SongAlbumOrder {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @ManyToOne(() => Album, { onDelete: "CASCADE" })
    @JoinColumn()
    public album: Album;

    @ManyToOne(() => Song, { onDelete: "CASCADE" })
    @JoinColumn()
    public song: Song;

    @Column({ nullable: true })
    public nr: number;

    
}