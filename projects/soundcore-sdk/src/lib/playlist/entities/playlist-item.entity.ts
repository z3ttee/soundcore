import { Song } from "../../song/entities/song.entity";
import { Playlist } from "./playlist.entity";

export type PlaylistItemID = number;
export class PlaylistItem {

    public id: PlaylistItemID;
    public createdAt: Date;
    public order: number;

    public song?: Song;
    public playlist?: Playlist;

}