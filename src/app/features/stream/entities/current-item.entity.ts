import { PlayableListType } from "src/lib/data/playable-list.entity";
import { Song } from "../../song/entities/song.entity";

export class CurrentPlayingItem<T> {

    constructor(
        public readonly song: Song,
        public readonly type: PlayableListType,
        public readonly context?: T
    ) {}

    public get id(): string {
        return this.song?.id;
    }

}