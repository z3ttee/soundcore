
/**
 * Enum to handle different
 * Tracklist types.
 * @deprecated
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

/**
 * Class to handle items
 * inside a Tracklist.
 * It consists currently only of an id
 * that corresponds to a song.
 * @deprecated
 */
export class TracklistItem {
    /**
     * Song id.
     */
    public readonly id: number;
}

/**
 * Class to handle Tracklists.
 * It contains the size, type
 * and items of a tracklist.
 * @deprecated
 */
export class SCSDKTracklist {

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
        public readonly itemIds: TracklistItem[],
        /**
         * Returns a relative url that points
         * to the metadata endpoint for that list.
         * Default: /meta
         */
        public readonly relativeMetaUrl: string,

        public baseUrl?: string
    ) {}

}