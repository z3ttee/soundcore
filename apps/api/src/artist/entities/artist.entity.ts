import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { ArtistArtwork } from "../../artwork/entities/artwork.entity";
import { Song } from "../../song/entities/song.entity";
import { MeilisearchHasOne, MeilisearchIndex, MeilisearchPK, MeilisearchProp } from "@soundcore/meilisearch";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";
import { GeniusInfo } from "../../utils/entities/genius.entity";
import { PlayableEntity, PlayableEntityType } from "../../tracklist/entities/playable.entity";

@Entity()
@MeilisearchIndex()
export class Artist implements PlayableEntity {
    /**
     * PLAYABLE ENTITY ATTRIBUTES
     */
    public readonly type: PlayableEntityType = PlayableEntityType.ALBUM;

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
    @MeilisearchPK({ searchable: false })
    public id: string;

    @Column({ nullable: false, unique: true })
    @MeilisearchProp()
    public slug: string;

    @Column({ nullable: true, type: "text" })
    public description: string;

    @Column({ nullable: false, unique: true, collation: "utf8mb4_bin" })
    @MeilisearchProp()
    public name: string;

    @CreateDateColumn()
    public createdAt: Date;

    @OneToMany(() => Album, (a) => a.primaryArtist)
    public albums: Album[];

    @ManyToOne(() => ArtistArtwork, { onDelete: "SET NULL" })
    @JoinColumn()
    @MeilisearchHasOne(() => ArtistArtwork)
    public artwork: ArtistArtwork;

    @OneToMany(() => Song, (song) => song.primaryArtist, { cascade: ["insert", "update"] })
    public songs: Song[];

    public songCount?: number = undefined;
    public albumCount?: number = undefined;
    public streamCount?: number = undefined;

}