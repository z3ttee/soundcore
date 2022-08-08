import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Like } from "../../collection/entities/like.entity";
import { User } from "../../user/entities/user.entity";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";
import { PlaylistItem } from "./playlist-item.entity";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";

@Entity()
export class Playlist implements Resource, Syncable {
    public resourceType: ResourceType = "playlist";

    @Column({ nullable: true, default: null})
    public lastSyncedAt: Date;

    @Column({ default: 0 })
    public lastSyncFlag: SyncFlag;

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ type: "tinyint", default: 0 })
    public flag: ResourceFlag;

    @Column({ nullable: true, unique: true, length: 120 })
    public slug: string;

    @Index()
    @Column({ nullable: false, name: "title" })
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

    @OneToMany(() => Like, (l) => l.playlist)
    public likedBy: Like[];

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