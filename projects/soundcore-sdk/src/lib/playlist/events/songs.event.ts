import { Song } from "../../song/entities/song.entity";
import { Playlist } from "../entities/playlist.entity";
import { PlaylistEvent, PlaylistEventType } from "./playlist.event";

export class PlaylistSongsEvent extends PlaylistEvent {

    constructor(
        type: PlaylistEventType,
        playlist: Playlist,
        public readonly songs: Song[]
    ){
        super(type, playlist);
    }

}