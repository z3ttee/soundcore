
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { LikedResource } from "../../collection/entities/like.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Stream } from "../../stream/entities/stream.entity";
import { Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";
import { ImportTask } from "../../import/entities/import.entity";
import { MeilisearchInfo } from "../../utils/entities/meilisearch.entity";
import { MeilisearchIndex, MeilisearchPK, MeilisearchProp } from "@soundcore/meilisearch";

// TODO: Remove attributes from Syncable object when they get sent as response
// TODO: Split profile and users logic

@Entity()
@MeilisearchIndex()
export class User implements Resource {
    public flag: ResourceFlag = ResourceFlag.OK;
    public resourceType: ResourceType = "user";

    /**
     * MEILISEARCH RELATED ATTRIBUTES
     */
    @Column(() => MeilisearchInfo)
    public meilisearch: MeilisearchInfo;

    /**
     * DEFAULT ATTRIBUTES
     */
    @PrimaryColumn({ type: "varchar" })
    @MeilisearchPK({ searchable: false })
    public id: string;

    @Column({ nullable: true, unique: true, length: 120 })
    @MeilisearchProp()
    public slug: string;

    @Column({ nullable: true, length: 120 })
    @MeilisearchProp()
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
    
    @OneToMany(() => LikedResource, (l) => l.user, { onDelete: "CASCADE" })
    public likedResources?: LikedResource;

    @CreateDateColumn()
    public createdAt?: Date;

    @UpdateDateColumn()
    public updatedAt?: Date;

    @OneToMany(() => PlaylistItem, (item) => item.addedBy)
    public itemsAddedToPlaylists?: PlaylistItem[];

    @OneToMany(() => ImportTask, (task) => task.user)
    public imports: ImportTask[];

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