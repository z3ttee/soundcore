
import { ChildEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, TableInheritance } from "typeorm";
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
    AWAITING = "awaiting",
    OK = "ok",
    ERROR = "error",
    ABORTED = "aborted"
}

export interface ArtworkID {
    id: string;
}

@Entity()
@TableInheritance({ column: "type" })
export abstract class Artwork {
    @PrimaryColumn({ unique: true, nullable: false })
    public id: string;

    @Column({ type: "enum", enum: ArtworkFlag, nullable: false, default: ArtworkFlag.AWAITING })
    public flag: ArtworkFlag;

    @Column({ name: "type", type: "enum", enum: ArtworkType, nullable: false })
    public type: ArtworkType;

    @Column({ type: "char", length: 7, nullable: true })
    public accentColor: string;

    @CreateDateColumn()
    public createdAt?: Date;
}

@ChildEntity(ArtworkType.SONG)
export class SongArtwork extends Artwork {

    @OneToMany(() => Song, (song) => song.artwork)
    public songs: Song[];
}

@ChildEntity(ArtworkType.ALBUM)
export class AlbumArtwork extends Artwork {

    @OneToMany(() => Album, (album) => album.artwork)
    public albums: Album[];
}

@ChildEntity(ArtworkType.ARTIST)
export class ArtistArtwork extends Artwork {

    @OneToMany(() => Artist, (artist) => artist.artwork)
    public artists: Artist[];
}

@ChildEntity(ArtworkType.DOWNLOADABLE)
export class DownloadableArtwork extends Artwork {

    @Column({ type: "enum", enum: ArtworkType, nullable: true })
    public dstType: ArtworkType;
    
    @Column({ type: "varchar", nullable: true })
    public srcUrl: string;

}