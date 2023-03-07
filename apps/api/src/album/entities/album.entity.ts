
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Artist } from "../../artist/entities/artist.entity";
import { AlbumArtwork } from "../../artwork/entities/artwork.entity";
import { LikedAlbum } from "../../collection/entities/like.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Label } from "../../label/entities/label.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Song } from "../../song/entities/song.entity";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { IndexEntity, PrimaryKey, Property } from "@soundcore/meilisearch";
import { GeniusInfo } from "../../utils/entities/genius.entity";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";

@Entity()
@IndexEntity()
@Index(["name", "primaryArtist"], { unique: true })
export class Album implements Resource {
    public resourceType: ResourceType = "album";

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
    @PrimaryKey()
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

    /**
     * RELATIONS
     */
    @ManyToOne(() => Artist)
    @JoinColumn()
    public primaryArtist: Artist;

    @OneToMany(() => Song, (song) => song.album, { cascade: ["insert", "update"] })
    public songs: Song[];

    @ManyToOne(() => AlbumArtwork, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public artwork: AlbumArtwork;

    @ManyToMany(() => Distributor)
    @JoinTable({ name: "album2distributor" })
    public distributors: Distributor[];

    @ManyToMany(() => Label)
    @JoinTable({ name: "album2label" })
    public labels: Label[];

    @ManyToMany(() => Publisher)
    @JoinTable({ name: "album2publisher" })
    public publishers: Publisher[];

    @OneToMany(() => LikedAlbum, (l) => l.album)
    public likedBy: LikedAlbum[];

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

@IndexEntity()
export class AlbumIndex {

    @PrimaryKey()
    public key: string;

    @Property()
    public test: string;

}