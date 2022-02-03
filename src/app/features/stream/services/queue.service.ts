import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { PlayableList } from "src/app/entities/playable-list.entity";
import { Song } from "../../song/entities/song.entity";

abstract class QueueItem {
    constructor(public isList: boolean = false){}
}

export class QueueList extends QueueItem {
    public item: PlayableList;
    public list: Song[] = [];
    private index: number = 0;
    private hasStarted: boolean = false;

    constructor(playableList: PlayableList, private httpClient: HttpClient) {
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
        // if(this.currentIndex >= this.item.totalElements) return null;

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

export class QueueSong extends QueueItem {
    public item: Song;

    constructor(song: Song) {
        super(false);
        this.item = song;
    }
}

@Injectable()
export class StreamQueueService {

    private _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private _queue: QueueItem[] = [];

    public $size: Observable<number> = this._sizeSubject.asObservable();

    constructor(private httpClient: HttpClient) {}

    public get size(): number {
        const size = this._queue.reduce((size: number, item: QueueItem) => {
            if(!item.isList) {
                size++;
            } else {
                size += (item as QueueList).list.length
            }
            return size;
        }, 0);

        return size;
    }

    /**
     * Remove and get a song from the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public async dequeue(): Promise<Song> {
        if(this.isEmpty()) return null;

        const index = 0;
        const nextItem = this._queue[index];

        if(!nextItem.isList) {
            const item = (this._queue.splice(index, 1)[0] as QueueSong)?.item;
            this.setNewSize(this.size);
            return item;
        } else {
            const item = await (nextItem as QueueList)?.getNextItem();
            if(!item) {
                // Enqueued list is empty, that means it is done playing.
                this._queue.splice(index, 1);
            }
            this.setNewSize(this.size);
            return item;
        }
    }

    /**
     * Dequeue a random element from the queue
     * @returns Song
     */
     public async random(): Promise<Song> {
        if(this.isEmpty()) return null;

        const index = Math.floor(Math.random() * this.size);
        const nextItem = this._queue[index];

        if(!nextItem.isList) {
            const item = await (this._queue.splice(index, 1)[0] as QueueSong)?.item;
            this.setNewSize(this.size);
            return item;
        } else {
            const item = (nextItem as QueueList)?.getNextItem();
            if(!item) {
                // Enqueued list is empty, that means it is done playing.
                this._queue.splice(index, 1);
            }
            this.setNewSize(this.size);
            return item;
        }
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public enqueueSong(song: Song): void {
        this._queue.push(new QueueSong(song));
        this.setNewSize(this.size);
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
     public enqueueList(list: PlayableList): void {
        if(this._queue.findIndex((i: QueueList) => i.isList && i?.item?.resourceId == list.resourceId) != -1) {
            console.warn("[QUEUE] Cannot enqueue playable list. Already in queue")
            return;
        }
        
        this._queue.push(new QueueList(list, this.httpClient));
        this.setNewSize(this.size);
    }

    /**
     * Get next element from queue without removing it.
     * @returns Song
     */
    public peek(): QueueItem {
        return this._queue[0];
    }

    /**
     * Check if the queue is empty.
     * @returns True or False
     */
    public isEmpty(): boolean {
        return this._queue.length <= 0;
    }

    private setNewSize(size: number) {
        this._sizeSubject.next(size)
    }


}