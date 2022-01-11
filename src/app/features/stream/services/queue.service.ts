import { Song } from "../../song/entities/song.entity";

export class StreamQueueService {

    private _queue: Song[];

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
        return this._queue.splice(0, 1)[0];
    }

    /**
     * Add a song to the queue
     * @param song Song to enqueue
     * @returns Song
     */
    public enqueue(song: Song): void {
        this._queue.push(song);
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