
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum ArtworkType {
    SONG = 0,
    ALBUM,
    PLAYLIST,
    ARTIST,
    PUBLISHER,
    LABEL,
    DISTRIBUTOR,
    BANNER
}

export enum ArtworkFlag {
    OK = 0,
    PROCESSING,
    ERROR,
}

export class ArtworkColors {
    /**
     *  Formerly used as accentColor
     */ 
    public vibrant: string;

    public darkMuted: string;
    public darkVibrant: string;
    public lightMuted: string;
    public lightVibrant: string;
    public muted: string;
}

@Entity()
export class Artwork {
    
    @PrimaryGeneratedColumn("uuid")
    public id: string;
    
    @Column({ type: "tinyint", default: 0 })
    public type?: ArtworkType;

    @Column({ type: "json", nullable: true })
    public colors?: ArtworkColors;

    @Column()
    public name?: string;

    @CreateDateColumn()
    public createdAt?: Date;

    @Column({ type: "tinyint", default: 0 })
    public flag?: ArtworkFlag;

}