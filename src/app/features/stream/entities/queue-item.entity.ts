import { HttpClient } from "@angular/common/http";
import { PlayableList } from "src/lib/data/playable-list.entity";
import { Song } from "../../song/entities/song.entity";

export abstract class QueueItem {
    constructor(public isList: boolean = false){}
}

/**
 * Class for managing single songs in queue, 
 * that are independent of an album, 
 * artist or playlist context.
 */
export class QueueSong extends QueueItem {
    public item: Song;

    constructor(song: Song) {
        super(false);
        this.item = song;
    }
}

/**
 * Class for managing playable lists 
 * like album or playlists in general.
 */
export class QueueList extends QueueItem {
    public item: PlayableList<any>;
    public list: Song[] = [];

    constructor(playableList: PlayableList<any>) {
        super(true);
        this.item = playableList;
    }

    public async getNextItem(): Promise<Song> {
        return this.item.emitNextSong()
    }
}