
import { MeilisearchIndex, MeilisearchPK } from "@soundcore/meilisearch";
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

export type ArtworkDTO = Pick<Artwork, "id"> & Pick<Artwork, "type"> & Partial<Pick<SongArtwork, "songs">>;
export type ArtworkWithColorDTO = Pick<Artwork, "id"> & Pick<Artwork, "type"> & Pick<Artwork, "accentColor"> & Pick<Artwork, "flag"> & Partial<Pick<SongArtwork, "songs">>;
export type ArtworkWriteResult = {
    succeeded: ArtworkWithColorDTO[];
    errored: ArtworkDTO[];
}

@Entity()
@TableInheritance({ column: "type" })
export abstract class Artwork {
    @PrimaryColumn({ unique: true, nullable: false })
    @MeilisearchPK({ searchable: false })
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
@MeilisearchIndex()
export class SongArtwork extends Artwork {

    @OneToMany(() => Song, (song) => song.artwork)
    public songs: Song[];
}

@ChildEntity(ArtworkType.ALBUM)
@MeilisearchIndex()
export class AlbumArtwork extends Artwork {

    @OneToMany(() => Album, (album) => album.artwork)
    public albums: Album[];
}

@ChildEntity(ArtworkType.ARTIST)
@MeilisearchIndex()
export class ArtistArtwork extends Artwork {

    @OneToMany(() => Artist, (artist) => artist.artwork)
    public artists: Artist[];
}

@ChildEntity(ArtworkType.DOWNLOADABLE)
@MeilisearchIndex()
export class DownloadableArtwork extends Artwork {

    @Column({ type: "enum", enum: ArtworkType, nullable: true })
    public dstType: ArtworkType;
    
    @Column({ type: "varchar", nullable: true })
    public srcUrl: string;

}