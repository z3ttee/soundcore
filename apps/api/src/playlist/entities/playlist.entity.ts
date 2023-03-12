import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { LikedPlaylist } from "../../collection/entities/like.entity";
import { User } from "../../user/entities/user.entity";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";
import { PlaylistItem } from "./playlist-item.entity";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";
import { GeniusInfo } from "../../utils/entities/genius.entity";

@Entity()
@Index(["name", "author"], { unique: true })
export class Playlist implements Resource {
    public resourceType: ResourceType = "playlist";

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

    @Column({ nullable: true, unique: true, length: 120 })
    public slug: string;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: true, length: 254 })
    public description: string;

    @Column({ nullable: false, default: "public" })
    public privacy: PlaylistPrivacy;

    @CreateDateColumn()
    public createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn()
    public author: User;

    @OneToMany(() => PlaylistItem, pi => pi.playlist)
    public items: PlaylistItem[];

    @ManyToOne(() => Artwork, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public artwork?: Artwork;

    @OneToMany(() => LikedPlaylist, (l) => l.playlist)
    public likedBy: LikedPlaylist[];

    public songsCount?: number = 0;

    /**
     * Total Duration of the Playlist
     */
    @Column({ select: false } )
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