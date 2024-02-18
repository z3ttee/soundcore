import { Song } from "../../song/entities/song.entity";
import { Page } from "@soundcore/common"
import { PlayableEntityType } from "./playable.entity";

// export enum TracklistTypeV2 {
//     PLAYLIST = "playlist",
//     SINGLE = "single",
//     ALBUM = "album",
//     ARTIST = "artist",
//     FAVORITES = "favorites"
// }

export class TracklistV2<T = Song> {
    public readonly id: string;
    public readonly type: PlayableEntityType;
    public readonly size: number;
    public readonly seed?: number;
    public items: Page<T>;
}