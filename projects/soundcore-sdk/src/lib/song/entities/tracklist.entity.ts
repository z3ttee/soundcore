import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";
import { Song } from "./song.entity";

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
 * Class to handle Tracklists.
 * It contains the size, type
 * and items of a tracklist.
 */
export class SCDKTracklist<T = (PlaylistItem | Song)> {

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
        public readonly items: T[],
        /**
         * Returns a relative url that points
         * to the metadata endpoint for that list.
         * Default: /meta
         */
        public readonly metadataLocation: string
    ) {}

}