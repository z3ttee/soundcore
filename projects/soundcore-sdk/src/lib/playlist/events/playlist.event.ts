import { Playlist } from "../entities/playlist.entity";

export type PlaylistEventType = "added" | "updated" | "removed"
export class PlaylistEvent {

    constructor(
        public readonly type: PlaylistEventType,
        public readonly playlist: Playlist
    ){ }

}