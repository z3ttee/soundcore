import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Song } from "../../song/entities/song.entity";

@Injectable()
export class StreamQueueService {

    private _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private _queue: Song[] = [];

    public $size: Observable<number> = this._sizeSubject.asObservable();

    public get size(): number {
        return this._queue.length;
    }

    /**
     * Remove and get a song from the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public dequeue(): Song {
        if(this.isEmpty()) return null;

        const item = this._queue.splice(0, 1)[0];
        this._sizeSubject.next(this.size);
        return item;
    }

    /**
     * Dequeue a random element from the queue
     * @returns Song
     */
     public random(): Song {
        if(this.isEmpty()) return null;
        const index = Math.floor(Math.random() * this.size);

        const item = this._queue.splice(index, 1)[0];
        this._sizeSubject.next(this.size);
        return item;
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public enqueue(song: Song): void {
        this._queue.push(song);
        this._sizeSubject.next(this.size);
    }

    /**
     * Get next element from queue without removing it.
     * @returns Song
     */
    public peek(): Song {
        return this._queue[0];
    }

    /**
     * Check if the queue is empty.
     * @returns True or False
     */
    public isEmpty(): boolean {
        return this._queue.length <= 0;
    }


}