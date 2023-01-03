
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { ArtworkSourceType } from "../dtos/artwork-process.dto";

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
    AWAITING = 0,
    OK = 1,
    ERROR = 2,
}

export interface ArtworkID {
    id: string;
}

@Entity()
export class Artwork implements ArtworkID {
    
    @PrimaryColumn({ unique: true, nullable: false })
    public id: string;
    
    @Column({ type: "smallint", nullable: false })
    public type: ArtworkType;

    @Column({ type: "varchar", nullable: true })
    public sourceType: ArtworkSourceType;

    @Column({ type: "smallint", nullable: true })
    public sourceUri: string;

    @CreateDateColumn()
    public createdAt?: Date;

    @Column({ type: "smallint", default: 0 })
    public flag: ArtworkFlag;

    @Column({ type: "char", length: 7, nullable: true })
    public accentColor: string;

}