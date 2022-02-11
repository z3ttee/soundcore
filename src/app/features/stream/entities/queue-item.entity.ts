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
        
        // Check if its time to load new songs (if there are only less than 5 songs left)
        const availableElements = (this.item.nextPageIndex <= 1 ? 1 : this.item.nextPageIndex-1) * this.list.length;
                
        console.log(availableElements)
        /*if(this.currentIndex+5 >= availableElements && this.currentIndex < this.item.totalElements || !this.hasStarted) {
            // Fetch next page
            if(this.currentIndex >= availableElements || !this.hasStarted) {
                console.log("fetching await")
                await this.fetchNextPage();
            } else {
                console.log("fetching")
                this.fetchNextPage();
            }
        }*/

        const item = this.list.splice(this.index, 1)[0];
        if(!item) return null;
        console.log(item?.title)
        console.log()

        // Has started is true as soon as the first item of the list is requested and returned
        this.hasStarted = true;
        return item;
    }
}