
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Song } from "../../song/entities/song.entity";
import { ResourceType } from "../../utils/entities/resource";
import { createSlug } from "@repo/utilities";

@Entity()
export class Genre {
    public resourceType: ResourceType = "genre";

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: true, unique: true, length: 120 })
    public slug: string;

    @Column({ nullable: false, unique: true })
    public name: string;

    @Column({ nullable: true, type: "text" })
    public description: string;

    @ManyToOne(() => Artwork, { onDelete: "SET NULL" })
    @JoinColumn()
    public artwork: Artwork;

    @ManyToMany(() => Song)
    @JoinTable({ name: "song2genre" })
    public songs: Song[];

    @BeforeInsert()
    public onBeforeInsert() {
        this.slug = createSlug(this.name);
    }

    @BeforeUpdate()
    public onBeforeUpdate() {
        if (!this.slug) createSlug(this.name);
    }

}