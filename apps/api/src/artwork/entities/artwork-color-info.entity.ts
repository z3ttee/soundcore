import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Artwork } from "./artwork.entity";

@Entity()
export class ArtworkColorInfo {

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ length: 56, type: "char" })
    public vibrant: string;

    @Column({ length: 56, type: "char" })
    public darkMuted: string;

    @Column({ length: 56, type: "char" })
    public darkVibrant: string;

    @Column({ length: 56, type: "char" })
    public lightMuted: string;

    @Column({ length: 56, type: "char" })
    public lightVibrant: string;

    @Column({ length: 56, type: "char" })
    public muted: string;

    @OneToOne(() => Artwork, (artwork) => artwork.colorInfo, { nullable: false, onDelete: "CASCADE" })
    public artwork: Artwork;
}