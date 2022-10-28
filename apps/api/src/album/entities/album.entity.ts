
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Like } from "../../collection/entities/like.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Label } from "../../label/entities/label.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Song } from "../../song/entities/song.entity";
import { GeniusFlag, GeniusResource, Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";

@Entity()
@Index(["name", "primaryArtist"], { unique: true })
export class Album implements Resource, Syncable, GeniusResource {
    public resourceType: ResourceType = "album";

    /**
     * MEILISEARCH RELATED ATTRIBUTES
     */
    @Column({ nullable: true, default: null})
    public lastSyncedAt: Date;

    @Column({ default: 0 })
    public lastSyncFlag: SyncFlag;

    /**
     * GENIUS RELATED ATTRIBUTES
     */
    @Column({ type: "tinyint", default: 0 })
    public geniusFlag: GeniusFlag;

    @Column({ nullable: true })
    public geniusId: string;

    @Column({ nullable: false, default: 0 })
    public geniusFailedTries: number;

    /**
     * DEFAULT ATTRIBUTES
     */
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false, collation: "utf8mb4_bin" })
    public name: string;

    @Column({ nullable: true, unique: true, length: 120 })
    public slug: string;

    @Column({ type: "tinyint", default: 0 })
    public flag: ResourceFlag;

    @Column({ nullable: true })
    public releasedAt: Date;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({ nullable: true, type: "text" })
    public description: string;

    @ManyToOne(() => Artist)
    @JoinColumn()
    public primaryArtist: Artist;

    @OneToMany(() => Song, (song) => song.album)
    public songs: Song[];

    @ManyToOne(() => Artwork, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork?: Artwork;

    @ManyToMany(() => Distributor)
    @JoinTable({ name: "album2distributor" })
    public distributors: Distributor[];

    @ManyToMany(() => Label)
    @JoinTable({ name: "album2label" })
    public labels: Label[];

    @ManyToMany(() => Publisher)
    @JoinTable({ name: "album2publisher" })
    public publishers: Publisher[];

    @OneToMany(() => Like, (l) => l.album)
    public likedBy: Like[];

    public songsCount?: number;
    public totalDuration?: number;

    @BeforeInsert()
    public onBeforeInsert() {
        this.slug = Slug.create(this.name);
    }

    @BeforeUpdate() 
    public onBeforeUpdate() {
        if(!this.slug) Slug.create(this.name);
    }
}