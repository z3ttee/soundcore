import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "../../album/entities/album.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { GeniusFlag, Resource, ResourceFlag, ResourceType } from "../../utils/entities/resource";
import { Slug } from "@tsalliance/utilities";
import { Syncable, SyncFlag } from "../../meilisearch/interfaces/syncable.interface";
import { Song } from "../../song/entities/song.entity";

@Entity()
export class Artist implements Resource, Syncable {
    public resourceType: ResourceType = "artist";

    @Column({ nullable: true, default: null})
    public lastSyncedAt: Date;

    @Column({ default: 0 })
    public lastSyncFlag: SyncFlag;

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ type: "tinyint", default: 0 })
    public flag: ResourceFlag;

    @Column({ type: "tinyint", default: 0 })
    public geniusFlag: GeniusFlag;

    @Column({ nullable: true, unique: true, length: 120 })
    public slug: string;
    
    @Column({ nullable: true, unique: true })
    public geniusId: string;

    @Column({ nullable: true, type: "text" })
    public description: string;

    @Index({ unique: true })
    @Column({ nullable: false })
    public name: string;

    @CreateDateColumn()
    public createdAt: Date;

    @OneToMany(() => Album, (a) => a.primaryArtist)
    public albums: Album[];

    @ManyToOne(() => Artwork, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: Artwork;

    @OneToMany(() => Song, (song) => song.primaryArtist)
    public songs: Song[];

    public songsCount?: number = 0;
    public albumsCount?: number = 0;

    @Column({ select: false })
    public streamCount?: number = 0;

    @BeforeInsert()
    public onBeforeInsert() {
        this.slug = Slug.create(this.name);
    }

    @BeforeUpdate() 
    public onBeforeUpdate() {
        if(!this.slug) Slug.create(this.name);
    }

}