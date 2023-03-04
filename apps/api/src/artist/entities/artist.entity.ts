import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { ArtistArtwork, Artwork } from "../../artwork/entities/artwork.entity";
import { GeniusFlag, GeniusResource, Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";
import { Song } from "../../song/entities/song.entity";

@Entity()
export class Artist implements Resource, Syncable, GeniusResource {
    public resourceType: ResourceType = "artist";

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
    @Column({ nullable: true })
    public geniusId: string;

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

    @Column({ nullable: false, unique: true })
    public slug: string;

    @Column({ nullable: true, type: "text" })
    public description: string;

    @Column({ nullable: false, unique: true, collation: "utf8mb4_bin" })
    public name: string;

    @CreateDateColumn()
    public createdAt: Date;

    @OneToMany(() => Album, (a) => a.primaryArtist)
    public albums: Album[];

    @ManyToOne(() => ArtistArtwork, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: ArtistArtwork;

    @OneToMany(() => Song, (song) => song.primaryArtist, { cascade: ["insert", "update"] })
    public songs: Song[];

    public songCount?: number = 0;
    public albumCount?: number = 0;
    public streamCount?: number = 0;

}