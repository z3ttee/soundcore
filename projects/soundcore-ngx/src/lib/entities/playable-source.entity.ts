import { Observable, Subject } from "rxjs";
import { Song } from "soundcore-sdk";
import { v4 as uuidv4 } from "uuid";
import { SCNGXLogger } from "../utils/logger/logger";
import { Queue } from "../utils/queue/queue.util";

export class SCNGXTrackID {
    public id: string;
}

export class SCNGXTrack {
    public id: string;
    public $data: Observable<Song>;
}

export abstract class SCNGXPlayableSource {
    protected readonly logger: SCNGXLogger = new SCNGXLogger("PlaylistService");

    /**
     * Subject used to destroy subscriptions.
     */
    protected readonly _destroySubject: Subject<void> = new Subject();

    /**
     * ID of the source. Format: UUID v4
     */
    public readonly id: string = uuidv4();

    /**
     * Internal queue.
     */
    private readonly queue: Queue<SCNGXTrackID> = new Queue();

    /**
     * Function to return the song that the source should play.
     * If the source is not dequeued, this function will be called again once
     * the queue asks the source for a new song.
     */
    public next(): SCNGXTrack {
        const trackId = this.queue.dequeue();
        
        const track = new SCNGXTrack();
        track.id = trackId.id;
        track.$data = this.findByTrack(trackId)
        
        return track;
    }

    /**
     * Find metadata for a track. Should be returned as observable to allow async fetch operations.
     * @param track Track ID
     */
    protected abstract findByTrack(track: SCNGXTrackID): Observable<Song>;

    /**
     * Add a track to the internal queue.
     * @param track Track to add.
     */
    protected add(track: SCNGXTrackID): number {
        return this.queue.enqueue(track);
    }

     /**
     * Add a track to the internal queue.
     * @param track Track to add.
     */
    protected addAll(tracks: SCNGXTrackID[]) {
        return this.queue.enqueueAll(tracks);
    }

    /**
     * Remove a track from the internal queue.
     * @param track Track to remove.
     */
    protected remove(track: SCNGXTrackID): SCNGXTrackID {
        const index = this.queue.findPosition(track);
        if(index == -1) return null;
        return this.queue.dequeueAt(index);
    }

    /**
     * Used as helper function for
     * the audio queueing system. If the function
     * returns true, the source will be dequeued.
     * Otherwise it remains enqueued. Why? Because
     * playlists may have implemented an own queue,
     * to determine next song and dequeueing them 
     * will interrupt this behaviour.
     */
    public canBeDequeued(): boolean {
        return this.queue.isEmpty();
    }

    /**
     * Close down the playable list and release
     * all resources.
     */
    protected release() {
        this._destroySubject.next();
        this._destroySubject.complete();

        this.logger.log(`Destroyed playable list.`)
    }

}