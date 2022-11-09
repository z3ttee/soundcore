import { Injectable } from "@angular/core";
import { Queue, SCNGXTracklist } from "@soundcore/ngx";
import { Logger, Song } from "@soundcore/sdk";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { PlayerItem } from "../entities/player-item.entity";
import { AppAudioService } from "./audio.service";
import { AppControlsService } from "./controls.service";

@Injectable({
    providedIn: "root"
})
export class AppPlayerService {
    private readonly logger = new Logger("Player");

    constructor(
        private readonly controls: AppControlsService,
        private readonly audio: AppAudioService
    ) {
        this._singleQueue.$onAdded.subscribe(() => {
            this.logger.verbose(`New playable item waiting in queue. Queue size: ${this.queueSize}`);
        });

        this._singleQueue.$size.subscribe(() => {
            this.logger.verbose(`Queue state changed. Queue size: ${this.queueSize}`);
        })

        this.audio.$onNext.subscribe(() => {
            console.log("received onNext()");
            this.next();
        });
    }

    private readonly _currentItem: BehaviorSubject<PlayerItem> = new BehaviorSubject(null);

    /**
     * Observable version of isIdle() function.
     * Emits true, if the currently playing item is null (nothing playing).
     * Otherwise it emits false (currently playing).
     */
    public readonly $isIdle: Observable<boolean> = this._currentItem.asObservable().pipe(map((value) => !value));

    /**
     * Queue for handling single songs that were added to the playback queue
     */
    private readonly _singleQueue: Queue<Song> = new Queue();
    /**
     * Queue for handling tracklists that were added to the playback queue
     * Currently, this queue can have only one item at a time, but is built for
     * more items in mind (for now, it seems better UX-wise to just leave it by one).
     */
    private _enqueuedTracklist?: SCNGXTracklist;
    /**
     * Emits currently playing item.
     */
    public readonly $current: Observable<PlayerItem> = this._currentItem.asObservable();
    /**
     * Subject to control value of $size observable
     */
    private readonly _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    /**
     * Emits current size of the internal queue
     */
    public readonly $size: Observable<number> = this._sizeSubject.asObservable();
    /**
     * Redirected observable of AppAudioService.
     * Emits the current time in seconds of the audio src.
     */
    public readonly $currentTime: Observable<number> = this.audio.$currentTime;

    /**
     * Get full queue size
     */
    public get queueSize(): number {
        return this._singleQueue.size + (this._enqueuedTracklist?.queue?.size || 0);
    }

    /**
     * Play a single resource. This will enqueue the song
     * if "force" is not set to true.
     * @param song Song to play next
     * @param force If true, will play the song immediately and skips the currently playing song. This does not cancel playback of a whole tracklist, but just the current song
     */
    public playSingle(song: Song, force: boolean = true) {
        this.logger.log(`Enqueued song (force: ${force}): `, song);

        // Enqueue to top of the queue
        this._singleQueue.enqueueTop(song);
        this.updateSize();

        // Otherwise play immediately
        // TODO: This conflicts when in shuffle mode (When queue is not empty but shuffle is on, it may not pick the 0 index)
        if(force || this.isIdle()) {
            this.next().subscribe();
        }
    }

    /**
     * Play a tracklist. This will enqueue the tracklist if "force"
     * is not set to true. 
     * @param tracklist Tracklist to play next
     * @param force If true, will skip currently playing item and starts playing the tracklist
     */
    public playTracklist(tracklist: SCNGXTracklist, force: boolean = true) {
        // "Enqueue" tracklist
        this._enqueuedTracklist = tracklist;
        this.updateSize();

        if(force || this.isIdle()) {
            // Start with next title but take it from tracklist queue
            this.next(true).subscribe();
        }
    }

    /**
     * Play next track in queue.
     */
    private next(takeFromTracklist?: boolean): Observable<void> {   
        return this.getNext(takeFromTracklist).pipe(map((nextItem) => {
            if(!nextItem) {
                this.logger.log(`Queue is empty, cannot get next song`);
                this.audio.resetAtCurrent();
                return;
            }
    
            // Updated current item
            this._currentItem.next(nextItem);
    
            // Start playing current item
            this.audio.forcePlay(nextItem).subscribe();
        }));
    }

    /**
     * Check if the player is currently playing something.
     * Evaluates to true, if there is currently nothing playing, otherwise false.
     * @returns True or False
     */
    public isIdle(): boolean {
        return !this._currentItem.getValue();
    }

    /**
     * Skip currently playing track.
     */
    public skip() {
        this.logger.verbose(`Skipping current song...`);
        this.next().subscribe();
    }

    /**
     * Get the next available item.
     * @returns 
     */
    private getNext(takeFromTracklist?: boolean): Observable<PlayerItem> {
        let result: PlayerItem;

        if(this._singleQueue.isNotEmpty() && !takeFromTracklist) {
            // Single queue not empty, take from this queue first
            let item: Song;

            if(this.controls.isShuffled()) {
                item = this._singleQueue.dequeueRandom();
            } else {
                item = this._singleQueue.dequeue();
            }
            
            result = !item ? null : new PlayerItem(item, null);
        } else {
            // TODO: Tracklist needs overhaul
            // Otherwise take from tracklist queue
            
            // Check if there is a tracklist enqueued and if that tracklist is not empty
            if(this._enqueuedTracklist && this._enqueuedTracklist.queue.isNotEmpty()) {
                // If tracklist exists and queue is not empty, pick next

                const itemObservable: Observable<Song> = this.controls.isShuffled() ? this._enqueuedTracklist.dequeueRandom() : this._enqueuedTracklist.dequeue();
                return itemObservable.pipe(map((song) => {
                    return !song ? null : new PlayerItem(song, null);
                }));
            } else {
                // Otherwise dequeue tracklist
                this.dequeueTracklist();
            }

            result = null;
        }

        // Update size state because item could have been dequeued
        this.updateSize();
        return of(result);
    }
    /**
     * Dequeue tracklist by setting it to undefined.
     */
    private dequeueTracklist() {
        this._enqueuedTracklist = undefined;
        this.updateSize();
    }

    /**
     * Push update to size subject.
     */
    private updateSize() {
        this._sizeSubject.next(this.queueSize);
    }

    

}