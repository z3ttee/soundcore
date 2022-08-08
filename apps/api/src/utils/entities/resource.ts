import { Artwork } from "../../artwork/entities/artwork.entity";

export type ResourceType = "song" | "user" | "playlist" | "album" | "collection" | "artist" | "genre" | "publisher" | "distributor" | "label" | "index" | "mount" | "bucket"
export enum ResourceFlag {
    OK = 0,
    ERROR = 1
}

export enum GeniusFlag {
    OK = 0,
    GENIUS_PENDING,
    GENIUS_FAILED
}

export interface Resource {
    id: string;
    name: string;
    slug: string;
    flag: ResourceFlag;
    resourceType: ResourceType;
    artwork?: Artwork;
}