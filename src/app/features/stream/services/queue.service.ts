import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { PlayableList } from "src/lib/data/playable-list.entity";
import { Song } from "../../song/entities/song.entity";
import { CurrentPlayingItem } from "../entities/current-item.entity";
import { QueueItem, QueueList, QueueSong } from "../entities/queue-item.entity";

@Injectable({
    providedIn: "root"
})
export class StreamQueueService {

    private readonly _songsSubject: BehaviorSubject<QueueSong[]> = new BehaviorSubject([]);
    private readonly _listsSubject: BehaviorSubject<QueueList[]> = new BehaviorSubject([]);
    private readonly _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private readonly _onQueueWaitingSubject: Subject<QueueItem> = new Subject();

    private readonly _queueMap: Record<string, QueueItem> = {};
    private readonly _songsQueue: QueueSong[] = [];
    private readonly _listQueue: QueueList[] = [];

    public readonly $size: Observable<number> = this._sizeSubject.asObservable();
    public readonly $songs: Observable<QueueSong[]> = this._songsSubject.asObservable();
    public readonly $lists: Observable<QueueList[]> = this._listsSubject.asObservable();

    public readonly $onQueueWaiting: Observable<QueueItem> = this._onQueueWaitingSubject.asObservable();

    /**
     * Returns calculate size of the whole queue. This takes single
     * songs as well as playable lists into account by counting all songs
     * in lists. Use "length" if you want actual length of items in queue.
     */
    public get size(): number {
        const queue = [
            ...this._songsQueue,
            ...this._listQueue
        ]

        const size = queue.reduce((size: number, item: QueueItem) => {
            if(!item.isList) {
                size++;
            } else {
                size += (item as QueueList).item.queueSize;
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
        return this._songsQueue.length + this._listQueue.length;
    }

    /**
     * Remove and get a song from the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public async dequeue(random: boolean = false): Promise<CurrentPlayingItem> {
        if(this.isEmpty()) return null;

        let item: CurrentPlayingItem = null;
        let index: number = random ? Math.floor(Math.random() * this._songsQueue.length) : 0;
        const nextSong: QueueSong = this._songsQueue[index];

        if(nextSong) {
            const song = (this._songsQueue.splice(index, 1)[0] as QueueSong)?.item;
            item = new CurrentPlayingItem(song, null);
            delete this._queueMap[nextSong.id];
        } else {
            index = random ? Math.floor(Math.random() * this._listQueue.length) : 0
            const nextList: QueueList = this._listQueue[index];
    
            // This is in case the nextItem is a list. Then the item is used to access to internal list
            // of this data structure.
            const nextItem = await nextList?.getNextItem();
    
            if(!nextItem || nextList?.item?.queueSize <= 0) {
                // Enqueued list is empty, that means it is done playing.
                this._listQueue.splice(index, 1);
                delete this._queueMap[nextList.id];
            }

            item = new CurrentPlayingItem(nextItem, nextList.item);
        }

        // Calculate new size and push updates.
        this.update();
        return item;
    }

    /**
     * Dequeue a random element from the queue
     * @returns Song
     */
     public async random(): Promise<CurrentPlayingItem> {
        return this.dequeue(true)
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public enqueueSong(song: Song): void {
        const item = new QueueSong(song)
        this._songsQueue.push(item);
        this._queueMap[item.id] = item;
        this.update();
        this._onQueueWaitingSubject.next(item);
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
     public enqueueList(list: PlayableList<any>): void {
        if(this._queueMap[list.id]) {
            console.warn("[QUEUE] Cannot enqueue playable list. Already in queue")
            return;
        }
        
        const item = new QueueList(list);
        this._listQueue.push(item);
        this._queueMap[item.id] = item;
        this.update();
        this._onQueueWaitingSubject.next(item);
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
     public enqueueListTop(list: PlayableList<any>): void {
        if(this._queueMap[list.id]) {
            console.warn("[QUEUE] Cannot enqueue playable list. Already in queue")
            return;
        }
        
        const item = new QueueList(list);
        this._listQueue.unshift(item);
        this._queueMap[item.id] = item;
        this.update();
        this._onQueueWaitingSubject.next(item);
    }

    /**
     * Get next element from queue without removing it.
     * @returns Song
     */
    public peek(): QueueItem {
        return this._songsQueue[0] || this._listQueue[0];
    }

    public hasKey(key: string): boolean {
        return !!this.get(key);
    }

    public get(key: string): QueueItem {
        return this._queueMap[key];
    }

    /**
     * Check if the queue is empty.
     * @returns True or False
     */
    public isEmpty(): boolean {
        return this._songsQueue.length <= 0 && this._listQueue.length <= 0;
    }

    private update() {
        console.log("pushing new size: ", this.size)
        this._sizeSubject.next(this.size)
        this._listsSubject.next(this._listQueue);
        this._songsSubject.next(this._songsQueue);
    }


}