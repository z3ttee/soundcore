
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Genre } from "../../genre/entities/genre.entity";
import { Label } from "../../label/entities/label.entity";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Stream } from "../../stream/entities/stream.entity";
import { Slug } from "@tsalliance/utilities";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { LikedSong } from "../../collection/entities/like.entity";
import { File } from "../../file/entities/file.entity";
import { SongArtwork } from "../../artwork/entities/artwork.entity";
import { TracklistItem } from "../../tracklist/entities/tracklist.entity";
import { GeniusInfo } from "../../utils/entities/genius.entity";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";
import { IndexEntity, PrimaryKey, Property } from "@soundcore/meilisearch";

export interface SongID {
    id: string;
}

export const SONG_ARTWORK_RELATION_FK = "artworkId"

@Entity()
@Index(["name", "primaryArtist", "album", "duration", "order"], { unique: true })
export class Song implements SongID, Resource, TracklistItem {
    public resourceType: ResourceType = "song";

    /**
     * MEILISEARCH RELATED ATTRIBUTES
     */
    @Column(() => MeilisearchInfo)
    public meilisearch: MeilisearchInfo;

    /**
     * GENIUS RELATED ATTRIBUTES
     */
    @Column(() => GeniusInfo)
    public genius: GeniusInfo;

    /**
     * DEFAULT ATTRIBUTES
     */
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ type: "tinyint", default: 0 })
    public flag: ResourceFlag;

    @Column({ nullable: true, length: 120 })
    public slug: string;

    @Column({ nullable: false, collation: "utf8mb4_bin" })
    public name: string;

    @Column({ nullable: false, default: 0 })
    public duration: number;

    @Column({ type: "text", nullable: true })
    public location?: string;

    @Column({ type: "text", nullable: true })
    public youtubeUrl?: string;

    @Column({ nullable: true, type: "date" })
    public releasedAt?: Date;

    @Column({ default: false })
    public explicit: boolean;

    @Column({ nullable: true, type: "text" })
    public description?: string;

    @Column({ nullable: true, default: '0' })
    public youtubeUrlStart?: string;

    @Column({ nullable: true, default: null })
    public order: number;

    /**
     * DATABASE DATES
     */
    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    /**
     * ENTITY RELATIONS
     */
    @OneToOne(() => File, (file) => file.song, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public file: File;

    @ManyToOne(() => SongArtwork, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: SONG_ARTWORK_RELATION_FK })
    public artwork: SongArtwork;

    @ManyToOne(() => Artist, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public primaryArtist: Artist;

    @ManyToMany(() => Artist, { onDelete: "CASCADE", nullable: true })
    @JoinTable({ name: "featuring2song" })
    public featuredArtists: Artist[];

    @ManyToOne(() => Album, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public album: Album;

    @ManyToMany(() => Publisher)
    @JoinTable({ name: "song2publisher" })
    public publishers: Publisher[];

    @ManyToMany(() => Distributor)
    @JoinTable({ name: "song2distributor" })
    public distributors: Distributor[];

    @ManyToMany(() => Label)
    @JoinTable({ name: "song2label" })
    public labels: Label[];

    @ManyToMany(() => Genre)
    @JoinTable({ name: "song2genre" })
    public genres: Genre[];

    @OneToMany(() => PlaylistItem, pi => pi.song)
    public playlists: PlaylistItem[];

    @OneToMany(() => Stream, stream => stream.song)
    public streams: Stream[];

    @OneToMany(() => LikedSong, (l) => l.song)
    public likes: LikedSong[];

    // Value that will be set if the songs of a playlist
    // are fetched
    public playlistAdded?: Date;
    public streamCount = 0;
    public liked = false;
    public available = true;

    @BeforeInsert()
    public onBeforeInsert() {
        this.slug = Slug.create(this.name);
    }

    @BeforeUpdate() 
    public onBeforeUpdate() {
        if(!this.slug) Slug.create(this.name);
    }

}


@IndexEntity()
export class SongIndex {
    @PrimaryKey({ searchable: false })
    public id: string;

    @Property()
    public name: string;

    @Property()
    public slug: string;

    @Property()
    public explicit: boolean;

    @Property({ searchable: false })
    public artwork: { id: string };

    @Property()
    public primaryArtist: {
        id: string;
        slug: string;
        name: string;
    };

    @Property()
    public featuredArtists: {
        id: string;
        slug: string;
        name: string;
    }[];

    @Property()
    public album: {
        id: string;
        slug: string;
        name: string;
    };
}