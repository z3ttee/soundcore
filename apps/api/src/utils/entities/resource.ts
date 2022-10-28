import { Artwork } from "../../artwork/entities/artwork.entity";

export type ResourceType = "song" | "user" | "playlist" | "album" | "collection" | "artist" | "genre" | "publisher" | "distributor" | "label" | "index" | "mount" | "bucket"
export enum ResourceFlag {
    OK = 0,
    ERROR = 1
}

export enum GeniusFlag {
    AWAITING = 0,
    OK = 1,
    GENIUS_FAILED = 2
}

export interface Resource {
    id: string;
    name: string;
    resourceType: ResourceType;
}

export interface GeniusResource {
    geniusId?: string;
    geniusFlag: GeniusFlag;
    geniusFailedTries: number;
}