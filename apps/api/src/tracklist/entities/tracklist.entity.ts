import { Song } from "../../song/entities/song.entity";

/**
 * Enum to handle different
 * Tracklist types.
 */
export enum TracklistType {
    PLAYLIST = 0,
    ALBUM = 1,
    ARTIST = 2,
    ARTIST_TOP = 3,
    RANDOM = 4,
    COLLECTION = 5,
    LIKED_SONGS = 6
}

export enum TracklistTypeV2 {
    PLAYLIST = "playlist",
    SINGLE = "single",
    ALBUM = "album",
    ARTIST = "artist",
    FAVORITES = "favorites"
}

/**
 * Class to handle items
 * inside a Tracklist.
 * It consists currently only of an id
 * that corresponds to a song.
 */
export class TracklistItem {
    /**
     * Song id.
     */
    public readonly id: number | string;
}

/**
 * Class to handle Tracklists.
 * It contains the size, type
 * and items of a tracklist.
 */
export class Tracklist {

    constructor(
        /**
         * Size of the list
         */
        public readonly size: number,
        /**
         * Type of the list
         */
        public readonly type: TracklistType,
        /**
         * Items array
         */
        public readonly itemIds: (TracklistItem)[],
        /**
         * Returns a relative url that points
         * to the metadata endpoint for that list.
         * Default: /meta
         */
        public readonly relativeMetaUrl: string
    ) {}

}

export class TracklistV2<T = Song> {

    constructor(
        public readonly uri: string,
        public readonly type: TracklistTypeV2,
        public readonly size: number,
        public readonly items: T[],
        public readonly seed?: string
    ) {}

    public static resolveUri(resourceId: string, type: TracklistTypeV2) {
        return `${type}:${resourceId}`;
    }

}