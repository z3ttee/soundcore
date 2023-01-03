import { Mount } from "../../mount/entities/mount.entity";

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

export class Artwork {
    
    public id: string;
    public type?: ArtworkType;
    public colors?: ArtworkColors;
    public name?: string;
    public createdAt?: Date;
    public flag?: ArtworkFlag;
    public mount?: Mount;

}