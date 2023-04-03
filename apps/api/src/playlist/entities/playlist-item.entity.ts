import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";
import { Playlist } from "./playlist.entity";

@Entity({ name: "song2playlist" })
export class PlaylistItem {

    @PrimaryGeneratedColumn({ unsigned: true, type: "bigint" })
    public id: number;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({ nullable: true, default: 0 })
    public order: number;

    @ManyToOne(() => User, (u) => u.itemsAddedToPlaylists, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public addedBy: User;

    @ManyToOne(() => Song, (s) => s.playlists, { onDelete: "CASCADE" })
    @JoinColumn()
    public song: Song;

    @ManyToOne(() => Playlist, (p) => p.items, { onDelete: "CASCADE" })
    @JoinColumn()
    public playlist: Playlist;

}