import { Artwork, ArtworkType } from "../entities/artwork.entity";

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
    entities: T[];
    sourceType: ArtworkSourceType;
}

