import { Artwork, ArtworkType } from "../entities/artwork.entity";

export enum ArtworkProcessFlag {
    DEFAULT = 0,
    CONTINUE_PROCESSING
}

export enum ArtworkSourceType {
    URL = "url",
    SONG = "song"
}

export interface ArtworkSource<T = any> {
    type: ArtworkSourceType;
    data: T;
}

export interface ArtworkProcessEntry<T = any> {
    entity: Artwork,
    source: ArtworkSource<T>;
    resultType: ArtworkType;
}

export interface ArtworkProcessDTO<T = any> {
    flag: ArtworkProcessFlag;
    entities: T[];
    sourceType: ArtworkSourceType;
}

