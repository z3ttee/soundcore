import { PlayableList } from "src/lib/data/playable-list.entity";
import { Song } from "../../song/entities/song.entity";

export class CurrentPlayingItem {

    constructor(
        public readonly song: Song,
        public readonly context?: PlayableList<any>
    ) {}

    public get id(): string {
        return this.song?.id;
    }

    public get contextId(): string {
        return this.context?.["id"];
    }

}