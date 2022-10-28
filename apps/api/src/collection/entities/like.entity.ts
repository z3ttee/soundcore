import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";

export enum LikeType {
    SONG = 0,
    ALBUM,
    PLAYLIST
}

@Entity()
export class Like {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @CreateDateColumn()
    public likedAt: Date;

    @Column({ type: "tinyint", default: 0 })
    public type: LikeType;

    @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public user: User;

    @ManyToOne(() => Song, { onDelete: "CASCADE", nullable: true })
    @JoinColumn()
    public song?: Song;

    @ManyToOne(() => Playlist, { onDelete: "CASCADE", nullable: true })
    @JoinColumn()
    public playlist?: Playlist;

    @ManyToOne(() => Album, { onDelete: "CASCADE", nullable: true })
    @JoinColumn()
    public album?: Album;

}