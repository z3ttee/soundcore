import { ChildEntity, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
@TableInheritance({ column: { type: "smallint", name: "type" }})
export class LikedResource {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @CreateDateColumn()
    public likedAt: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public user: User;
}

@ChildEntity()
@Index(["user", "song"], { unique: true })
export class LikedSong extends LikedResource {
    @ManyToOne(() => Song, { onDelete: "CASCADE", nullable: true })
    @JoinColumn()
    public song?: Song;
}

@ChildEntity()
@Index(["user", "playlist"], { unique: true })
export class LikedPlaylist extends LikedResource {
    @ManyToOne(() => Playlist, { onDelete: "CASCADE", nullable: true })
    @JoinColumn()
    public playlist?: Playlist;
}

@ChildEntity()
@Index(["user", "album"], { unique: true })
export class LikedAlbum extends LikedResource {
    @ManyToOne(() => Album, { onDelete: "CASCADE", nullable: true })
    @JoinColumn()
    public album?: Album;
}