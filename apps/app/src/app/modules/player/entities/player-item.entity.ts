import { SCNGXTracklist } from "@soundcore/ngx";
import { Song } from "@soundcore/sdk";

export class PlayerItem {

    constructor(
        /**
         * Specify the resource's id. Used to check if a playlist
         * or song in a playlist is currently playing.
         * 
         */
        public readonly song: Song,
        /**
         * Contextual data like a tracklist or song
         * that is associated with the current item
         */
        public readonly tracklist?: SCNGXTracklist,
        public readonly fromHistory: boolean = false
    ) {}

}