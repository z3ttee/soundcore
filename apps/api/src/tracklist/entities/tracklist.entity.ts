import { Page } from "@soundcore/common";
import { Song } from "../../song/entities/song.entity";
import { PlayableEntityType } from "./playable.entity";

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
    public readonly id: number | string;
}

/**
 * Class to handle Tracklists.
 * It contains the size, type
 * and items of a tracklist.
 * @deprecated
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
        public readonly id: string,
        public readonly type: PlayableEntityType,
        public readonly size: number,
        public readonly items: Page<T>,
        public readonly seed?: number
    ) {}

}