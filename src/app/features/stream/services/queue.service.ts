import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, map, Observable, Subject } from "rxjs";
import { SnackbarService } from "src/app/services/snackbar.service";
import { PlayableList } from "src/lib/data/playable-list.entity";
import { SCResourceMap, SCResourceQueue } from "src/lib/data/resource";
import { Song } from "../../song/entities/song.entity";
import { QueueItem, QueueList, QueueSong } from "../entities/queue-item.entity";

@Injectable({
    providedIn: "root"
})
export class StreamQueueService {

    constructor(
        private snackbarService: SnackbarService,
    ) {}

    private readonly _onQueueWaitingSubject: Subject<void> = new Subject();
    private readonly _shuffleSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private readonly queueMap: SCResourceMap<QueueItem> = new SCResourceMap();
    private readonly songsQueue: SCResourceQueue<QueueSong> = new SCResourceQueue();
    private readonly listsQueue: SCResourceQueue<QueueList> = new SCResourceQueue();

    public readonly $size: Observable<number> = combineLatest([ this.songsQueue.$size, this.listsQueue.$size ]).pipe(map(([songs, lists]) => songs + lists));
    public readonly $songs: Observable<QueueSong[]> = this.songsQueue.$items;
    public readonly $lists: Observable<QueueList[]> = this.listsQueue.$items;

    public readonly $onQueueWaiting: Observable<void> = this._onQueueWaitingSubject.asObservable();

    public setShuffled(shuffled: boolean) {
        this._shuffleSubject.next(shuffled);

        this.songsQueue.$onQueueWaiting.subscribe(() => this._onQueueWaitingSubject.next())
        this.listsQueue.$onQueueWaiting.subscribe(() => this._onQueueWaitingSubject.next())
    }

    /**
     * Returns calculate size of the whole queue. This takes single
     * songs as well as playable lists into account by counting all songs
     * in lists. Use "length" if you want actual length of items in queue.
     */
    public get size(): number {
        const queue = [
            ...this.songsQueue.items(),
            ...this.listsQueue.items()
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
        return this.songsQueue.size() + this.listsQueue.size();
    }

    /**
     * Remove and get a song from the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public async dequeue(): Promise<Song> {
        const random = this._shuffleSubject.getValue();
        if(this.isEmpty()) return null;

        let queueItem: QueueItem = (await this.songsQueue.dequeue(random));
        let song: Song = (queueItem as QueueSong)?.item;
        if(song) {
            this.queueMap.remove(song.id);
            return song;
        }

        // Get next item from lists queue.
        // Only peek the next element, as the playlist should remain
        // enqueued until the list's internal queue is empty.
        const peek = (await this.listsQueue.peek());
        queueItem = peek.item;

        const list = (queueItem as QueueList)?.item;
        if(!list) return null;

        // Emit next song from list's internal queue
        song = await list.emitNextSong(random);

        // Check if the list's internal queue is empty.
        // If so, remove from the queue.
        if(list.queueSize <= 0) {
            this.queueMap.remove(queueItem.id);
            await this.listsQueue.dequeue();
        }

        return song;
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public enqueueSong(song: Song): void {
        const item = new QueueSong(song)
        this.queueMap.set(item);

        // Songs are always added to the top of each other in the queue
        this.songsQueue.enqueueTop(item); 
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public enqueueList(list: PlayableList<any>): void {
        const item = new QueueList(list);

        if(this.queueMap.has(item.id)) {
            this.snackbarService.error("Die Playlist befindet sich bereits in der Warteschlange.");
            return;
        }
        
        this.queueMap.set(item);
        this.listsQueue.enqueue(item);
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
     public enqueueListTop(list: PlayableList<any>): void {
        const item = new QueueList(list);

        if(this.queueMap.has(item.id)) {
            this.listsQueue.remove(item.id);
        }
        
        this.queueMap.set(item);
        this.listsQueue.enqueueTop(item);
    }

    public hasKey(key: string): boolean {
        return !!this.get(key);
    }

    public get(key: string): QueueItem {
        return this.queueMap.get(key);
    }

    /**
     * Check if the queue is empty.
     * @returns True or False
     */
    public isEmpty(): boolean {
        return this.songsQueue.size() <= 0 && this.listsQueue.size() <= 0;
    }


}