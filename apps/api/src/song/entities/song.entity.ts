
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
import { GeniusFlag, GeniusResource, Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { LikedSong } from "../../collection/entities/like.entity";
import { File } from "../../file/entities/file.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";
import { TracklistItem } from "../../tracklist/entities/tracklist.entity";

export interface SongID {
    id: string;
}

@Entity()
@Index(["name", "primaryArtist", "album", "duration", "order"], { unique: true })
export class Song implements SongID, Resource, Syncable, GeniusResource, TracklistItem {
    public resourceType: ResourceType = "song";

    /**
     * MEILISEARCH RELATED ATTRIBUTES
     */
    @Column({ nullable: true, default: null })
    public lastSyncedAt: Date;

    @Column({ default: 0, type: "tinyint" })
    public lastSyncFlag: SyncFlag;

    /**
     * GENIUS RELATED ATTRIBUTES
     */
    @Column({ nullable: true })
    public geniusId?: string;
 
    @Column({ type: "tinyint", default: 0 })
    public geniusFlag: GeniusFlag;
 
    @Column({ nullable: false, default: 0 })
    public geniusFailedTries: number;

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
    @OneToOne(() => File, (file) => file.song, { onDelete: "CASCADE" })
    @JoinColumn()
    public file: File;

    @ManyToOne(() => Artwork, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: Artwork;

    @ManyToOne(() => Artist, { cascade: ["insert", "update"] })
    @JoinColumn()
    public primaryArtist: Artist;

    @ManyToMany(() => Artist, { cascade: ["insert", "update"] })
    @JoinTable({ name: "featuring2song" })
    public featuredArtists: Artist[];

    @ManyToOne(() => Album, { cascade: ["insert", "update"] })
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
        this.lastSyncFlag = SyncFlag.AWAITING;
    }

}