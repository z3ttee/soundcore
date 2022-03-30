import { map, Observable } from "rxjs";
import { PlayableList } from "src/lib/data/playable-list.entity";
import { Song } from "../../song/entities/song.entity";

export abstract class QueueItem {
    public readonly id: string;
    public readonly isList: boolean;

    constructor(id: string, isList: boolean = false){
        this.id = id;
        this.isList = isList;
    }
}

/**
 * Class for managing single songs in queue, 
 * that are independent of an album, 
 * artist or playlist context.
 */
export class QueueSong extends QueueItem {
    public item: Song;

    constructor(song: Song) {
        super(song.id, false);
        this.item = song;
    }
}

/**
 * Class for managing playable lists 
 * like album or playlists in general.
 */
export class QueueList extends QueueItem {
    public item: PlayableList<any>;
    public $queueSize: Observable<number>;

    constructor(list: PlayableList<any>) {
        super(list.id, true);
        this.item = list;
        this.$queueSize = this.item.$queue.pipe(map((songs) => songs.length));
    }

    public async getNextItem(): Promise<Song> {
        return this.item.emitNextSong()
    }
}