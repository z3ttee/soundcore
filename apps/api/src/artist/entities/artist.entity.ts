import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { ArtistArtwork } from "../../artwork/entities/artwork.entity";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Song } from "../../song/entities/song.entity";
import { IndexEntity, PrimaryKey, Property } from "@soundcore/meilisearch";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";
import { GeniusInfo } from "../../utils/entities/genius.entity";

@Entity()
export class Artist implements Resource {
    public resourceType: ResourceType = "artist";

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

@IndexEntity()
export class ArtistIndex {

    @PrimaryKey({ searchable: false })
    public id: string;

    @Property()
    public name: string;

    @Property()
    public slug: string;

    @Property({ searchable: false })
    public artwork: { id: string };

}