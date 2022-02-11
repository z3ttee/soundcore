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

    /**
     * Returns calculate size of the whole queue. This takes single
     * songs as well as playable lists into account by counting all songs
     * in lists. Use "length" if you want actual length of items in queue.
     */
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
     * Returns actual length of items in queue. This does not count all songs in nested
     * playable lists. If you want to use that, consider choosing "size".
     */
    public get length(): number {
        return this._queue.length;
    }

    /**
     * Remove and get a song from the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public async dequeue(random: boolean = false): Promise<Song> {
        if(this.isEmpty()) return null;

        const index = random ? Math.floor(Math.random() * this.length) : 0;
        const nextItem = this._queue[index];
        let item: Song = null;

        if(!nextItem.isList) {
            // This is in case there is a single song added to the queue
            // The song gets removed from queue array and will be returned.
            // New size will be calculated and updated as a result.
            item = (this._queue.splice(index, 1)[0] as QueueSong)?.item;
        } else {
            // This is in case the nextItem is a list. Then the item is used to access to internal list
            // of this data structure.
            const listItem = (nextItem as QueueList);
            item = await listItem?.getNextItem();

            if(!item || listItem?.list?.length <= 0) {
                // Enqueued list is empty, that means it is done playing.
                this._queue.splice(index, 1);
            }
        }

        // Calculate new size and push updates.
        this.setNewSize(this.size);
        return item;
    }

    /**
     * Dequeue a random element from the queue
     * @returns Song
     */
     public async random(): Promise<Song> {
        return this.dequeue(true)
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