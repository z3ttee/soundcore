import { HttpClient } from "@angular/common/http";
import { PlayableList } from "src/app/entities/playable-list.entity";
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
    private index: number = 0;
    private hasStarted: boolean = false;
    private lastFetchFailed: boolean = false;

    constructor(playableList: PlayableList<any>, private httpClient: HttpClient) {
        super(true);
        this.item = playableList;

        let calculatedMinPage = Math.ceil(playableList.startSongIndex / playableList.pageSize);
        if(calculatedMinPage <= 2) calculatedMinPage = 3; // Min. 3 Pages

        this.index = playableList.startSongIndex || 0;
    }

    private async fetchNextPage(): Promise<Song[]> {
        return this.item.fetchNextBatch(this.httpClient).then((songs) => {
            console.log(songs)
            this.list.push(...songs)
            return this.list;
        })
    }

    public async getNextItem(): Promise<Song> {
        // Keine neuen Items verfügbar
        if(this.index >= this.item.totalElements) return null;

        // Check if any item has been fetched previously
        if(!this.hasStarted) {
            await this.fetchNextPage();
        }

        // Check if there are at least 5 items left in list.
        // If not, fetch the next page but only if also
        // there is enough to fetch (e.g.: A playlist with just 4 songs
        // would not go through the process of fetching next songs)

        // TODO: Optimize whole process, by completely fetching song ids contained in the playlist.
        // This allows for better shuffle and streaming of music even if metadata is not received yet

        if((this.list.length-5 <= 0 && this.item.totalElements > 5 && this.item.pageSize * (this.item.nextPageIndex) < this.item.totalElements) || this.lastFetchFailed) {
            await this.fetchNextPage().then(() => this.lastFetchFailed = false).catch(() => this.lastFetchFailed = true);
        } else {
            // At this point it might be the case the fetching next page previously failed that often so there are no songs left to play.
            // This forces the system to synchronously fetch the next page
            /*if((this.list.length <= 0 && this.item.totalElements > 0 && this.item.pageSize * (this.item.nextPageIndex) < this.item.totalElements)) {
                await this.fetchNextPage().then(() => this.lastFetchFailed = false).catch(() => this.lastFetchFailed = true);
            }*/
        }

        const item = this.list.splice(this.index, 1)[0];
        if(!item) return null;

        // Has started is true as soon as the first item of the list is requested and returned
        this.hasStarted = true;
        return item;
    }
}