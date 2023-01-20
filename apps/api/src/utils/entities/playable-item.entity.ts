import { Song } from "../../song/entities/song.entity";

export interface PlayableItem {
    id: bigint;
    metadata: Song;
}