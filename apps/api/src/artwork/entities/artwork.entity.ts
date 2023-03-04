
import { ChildEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";

export enum ArtworkType {
    SONG = "song",
    ALBUM = "album",
    PLAYLIST = "playlist",
    ARTIST = "artist",
    PUBLISHER = "publisher",
    LABEL = "label",
    DISTRIBUTOR = "distributor",
    BANNER = "banner",
    DOWNLOADABLE = "downloadable"
}

export enum ArtworkFlag {
    AWAITING = 0,
    OK = 1,
    ERROR = 2,
    ABORTED = 3
}

export interface ArtworkID {
    id: string;
}

@Entity()
@TableInheritance({ column: { name: "type" }})
export abstract class Artwork {
    @PrimaryColumn({ unique: true, nullable: false })
    public id: string;

    @Column({ type: "smallint", default: 0 })
    public flag: ArtworkFlag;

    @Column({ name: "type", type: "varchar", nullable: false })
    public type: ArtworkType;

    @Column({ type: "char", length: 7, nullable: true })
    public accentColor: string;

    @CreateDateColumn()
    public createdAt?: Date;
}

@ChildEntity()
export class SongArtwork extends Artwork {
    public readonly type: ArtworkType = ArtworkType.SONG;

    @OneToMany(() => Song, (song) => song.artwork)
    public songs: Song[];
}

@ChildEntity()
export class AlbumArtwork extends Artwork {
    public readonly type: ArtworkType = ArtworkType.ALBUM;

    @OneToMany(() => Album, (album) => album.artwork)
    public albums: Album[];
}

@ChildEntity()
export class ArtistArtwork extends Artwork {
    public readonly type: ArtworkType = ArtworkType.ARTIST;

    @OneToMany(() => Artist, (artist) => artist.artwork)
    public artists: Artist[];
}

@ChildEntity()
export class DownloadableArtwork extends Artwork {

    public readonly type: ArtworkType = ArtworkType.DOWNLOADABLE;

    @Column({ type: "smallint", nullable: true })
    public dstType: ArtworkType;
    
    @Column({ type: "smallint", nullable: true })
    public srcUrl: string;

}