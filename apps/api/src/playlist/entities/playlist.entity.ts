import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { LikedPlaylist } from "../../collection/entities/like.entity";
import { User } from "../../user/entities/user.entity";
import { Slug } from "@tsalliance/utilities";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";
import { PlaylistItem } from "./playlist-item.entity";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";
import { GeniusInfo } from "../../utils/entities/genius.entity";
import { MeilisearchHasOne, MeilisearchIndex, MeilisearchPK, MeilisearchProp } from "@soundcore/meilisearch";
import { PlayableEntity, PlayableEntityType } from "../../tracklist/entities/playable.entity";

@Entity()
@MeilisearchIndex()
@Index(["name", "author"], { unique: true })
export class Playlist implements PlayableEntity {
    /**
     * PLAYABLE ENTITY ATTRIBUTES
     */
    public readonly type: PlayableEntityType = PlayableEntityType.PLAYLIST;

    /**
     * MEILISEARCH RELATED ATTRIBUTES
     */
    @Column(() => MeilisearchInfo)
    public meilisearch: MeilisearchInfo;

    /**
     * DEFAULT ATTRIBUTES
     */

    @PrimaryGeneratedColumn("uuid")
    @MeilisearchPK({ searchable: false })
    public id: string;

    @Column({ nullable: false, unique: true, length: 120 })
    @MeilisearchProp()
    public slug: string;

    @Column({ nullable: false })
    @MeilisearchProp()
    public name: string;

    @Column({ nullable: true, length: 254 })
    public description: string;

    @Column({ nullable: false, default: "public" })
    public privacy: PlaylistPrivacy;

    @CreateDateColumn()
    public createdAt: Date;

    @MeilisearchHasOne(() => User)
    @ManyToOne(() => User)
    @JoinColumn()
    public author: User;

    @OneToMany(() => PlaylistItem, pi => pi.playlist)
    public items: PlaylistItem[];

    @MeilisearchHasOne(() => Artwork)
    @ManyToOne(() => Artwork, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public artwork?: Artwork;

    @OneToMany(() => LikedPlaylist, (l) => l.playlist)
    public likedBy: LikedPlaylist[];

    public songsCount?: number = 0;

    /**
     * Total Duration of the Playlist
     */
    public totalDuration?: number = 0;
    public likesCount?: number = 0;

    /**
     * Indicates whether the user 
     * has liked the playlist or not
     */
    public liked?: boolean = false;

    @BeforeInsert()
    public onBeforeInsert() {
        this.slug = Slug.create(this.name);
    }

    @BeforeUpdate() 
    public onBeforeUpdate() {
        if(!this.slug) Slug.create(this.name);
    }

}