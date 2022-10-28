
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Like } from "../../collection/entities/like.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Stream } from "../../stream/entities/stream.entity";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";

// TODO: Remove attributes from Syncable object when they get sent as response
// TODO: Split profile and users logic

@Entity()
export class User implements Resource, Syncable {
    public flag: ResourceFlag = ResourceFlag.OK;
    public resourceType: ResourceType = "user";

    @Column({ nullable: true, default: null})
    public lastSyncedAt: Date;

    @Column({ default: 0 })
    public lastSyncFlag: SyncFlag;

    @PrimaryColumn({ type: "varchar" })
    public id: string;

    @Column({ nullable: true, unique: true, length: 120 })
    public slug: string;

    @Column({ nullable: true, length: 120, name: "username" })
    public name: string;

    @Column({ nullable: true })
    public accentColor?: string;
    
    @OneToMany(() => Stream, stream => stream.listener)
    public streams?: Stream[];

    @ManyToOne(() => Artwork, { onDelete: "SET NULL", nullable: true })
    @JoinColumn()
    public artwork?: Artwork;
    
    @OneToMany(() => Playlist, (p) => p.author)
    public playlists?: Playlist[];
    
    @OneToMany(() => Like, (l) => l.user, { onDelete: "CASCADE" })
    public likedSongs?: Like;

    @CreateDateColumn()
    public createdAt?: Date;

    @UpdateDateColumn()
    public updatedAt?: Date;

    @OneToMany(() => PlaylistItem, (item) => item.addedBy)
    public itemsAddedToPlaylists?: PlaylistItem[];

    public friendsCount? = 0;
    public playlistCount? = 0;

    @BeforeInsert()
    public onBeforeInsert() {
        this.slug = Slug.create(this.name);
    }

    @BeforeUpdate() 
    public onBeforeUpdate() {
        if(!this.slug) Slug.create(this.name);
    }
}