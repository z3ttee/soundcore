import { Song } from "../../song/entities/song.entity";
import { Page } from "@soundcore/common"

export enum TracklistTypeV2 {
    PLAYLIST = "playlist",
    SINGLE = "single",
    ALBUM = "album",
    ARTIST = "artist",
    FAVORITES = "favorites"
}

export class TracklistV2<T = Song> {

    public readonly uri: string;
    public readonly type: TracklistTypeV2;
    public readonly size: number;
    public readonly items: Page<T>;
    public readonly seed?: string;

}