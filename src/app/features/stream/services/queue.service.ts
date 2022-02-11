import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { PlayableList } from "src/app/entities/playable-list.entity";
import { Song } from "../../song/entities/song.entity";
import { QueueItem, QueueList, QueueSong } from "../entities/queue-item.entity";

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
            // This is in case there is a single song added to the queue
            // The song gets removed from queue array and will be returned.
            // New size will be calculated and updated as a result.
            const item = (this._queue.splice(index, 1)[0] as QueueSong)?.item;
            this.setNewSize(this.size);
            return item;
        } else {
            // This is in case the nextItem is a list. Then the item is used to access to internal list
            // of this data structure.
            const listItem = (nextItem as QueueList);
            const item = await listItem?.getNextItem();

            if(!item || listItem?.list?.length <= 0) {
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
     public enqueueList(list: PlayableList<any>): void {
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