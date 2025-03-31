import { Song } from "../../song/entities/song.entity";
import { Playlist } from "./playlist.entity";

export class PlaylistItem {

    public id: number;
    public createdAt: Date;
    public order: number;

    public song?: Song;
    public playlist?: Playlist;

}