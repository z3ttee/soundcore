
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Genre } from "../../genre/entities/genre.entity";
import { Label } from "../../label/entities/label.entity";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Stream } from "../../stream/entities/stream.entity";
import { Slug } from "@tsalliance/utilities";
import { GeniusFlag, Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Like } from "../../collection/entities/like.entity";
import { File } from "../../file/entities/file.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";

@Entity()
export class Song implements Resource, Syncable {
    public resourceType: ResourceType = "song";

    @Column({ nullable: true, default: null})
    public lastSyncedAt: Date;

    @Column({ default: 0 })
    public lastSyncFlag: SyncFlag;

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ type: "tinyint", default: 0 })
    public flag: ResourceFlag;

    @Column({ type: "tinyint", default: 0 })
    public geniusFlag: GeniusFlag;

    @Column({ nullable: true, length: 120 })
    public slug: string;
    
    @Column({ nullable: true })
    public geniusId: string;

    @Column({ nullable: true })
    public name: string;

    @Column({ nullable: false, default: 0 })
    public duration: number;

    @Column({ type: "text", nullable: true })
    public location: string;

    @Column({ type: "text", nullable: true })
    public youtubeUrl: string;

    @Column({ nullable: true, type: "date" })
    public releasedAt: Date;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({ default: false })
    public explicit: boolean;

    @Column({ nullable: true, type: "text" })
    public description: string;

    @Column({ nullable: true, default: '0' })
    public youtubeUrlStart: string;

    @OneToOne(() => File, { onDelete: "CASCADE" })
    @JoinColumn()
    public file: File;

    @ManyToOne(() => Artwork, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: Artwork;

    @ManyToOne(() => Artist)
    public primaryArtist: Artist;

    @ManyToMany(() => Artist)
    @JoinTable({ name: "featuring2song" })
    public featuredArtists: Artist[];

    @ManyToMany(() => Publisher)
    @JoinTable({ name: "song2publisher" })
    public publishers: Publisher[];

    @ManyToMany(() => Distributor)
    @JoinTable({ name: "song2distributor" })
    public distributors: Distributor[];

    @ManyToMany(() => Label)
    @JoinTable({ name: "song2label" })
    public labels: Label[];

    @ManyToOne(() => Album)
    @JoinColumn()
    public album: Album;

    @Column({ nullable: true, default: null })
    public order: number;

    @ManyToMany(() => Genre)
    @JoinTable({ name: "song2genre" })
    public genres: Genre[];

    @OneToMany(() => PlaylistItem, pi => pi.song)
    public playlists: PlaylistItem[];

    @OneToMany(() => Stream, stream => stream.song)
    public streams: Stream[];

    @OneToMany(() => Like, (l) => l.song)
    public likes: Like[];

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