import { Artwork } from "../../artwork/entities/artwork.entity";

export type SCDKResourceType = "song" | "user" | "playlist" | "album" | "collection" | "artist" | "genre" | "publisher" | "distributor" | "label" | "index" | "mount" | "bucket"
export interface SCDKResource {

    id: any;
    resourceType: SCDKResourceType;
    slug: string;
    name: string;
    artwork?: Artwork;

}

export enum SCDKResourceFlag {
    OK = 0,
    ERROR
}

export enum SCDKGeniusFlag {
    OK = 0,
    GENIUS_PENDING,
    GENIUS_FAILED
}