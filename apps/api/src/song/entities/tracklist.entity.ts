import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";

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
    COLLECTION = 5
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
    public readonly id: string;
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
        public readonly items: (PlaylistItem | TracklistItem)[],
        /**
         * Returns a relative url that points
         * to the metadata endpoint for that list.
         * Default: /meta
         */
        public readonly metadataLocation: string
    ) {}

}