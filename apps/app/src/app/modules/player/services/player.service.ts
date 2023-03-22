import { Injectable } from "@angular/core";
import { isNull } from "@soundcore/common";
import { LikedSong, PlaylistItem, SCSDKStreamService, Song } from "@soundcore/sdk";
import { BehaviorSubject, Observable, of, switchMap, take, tap } from "rxjs";
import { ResourceWithTracklist } from "../entities/resource-with-tracklist.entity";
import { SCNGXTracklist } from "../entities/tracklist.entity";
import { AudioController } from "./controls.service";
import { AudioQueue } from "./queue.service";

export type PlayableItem = Song & PlaylistItem & LikedSong

export type Streamable = PlayableItem & {
    url: string;
}

@Injectable({
    providedIn: "root"
})
export class PlayerService {

    private readonly currentItem: BehaviorSubject<Streamable> = new BehaviorSubject(null);
    public readonly $currentItem = this.currentItem.asObservable();

    private readonly isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly $isLoading = this.isLoading.asObservable();

    constructor(
        private readonly queue: AudioQueue,
        private readonly controls: AudioController,
        private readonly streamService: SCSDKStreamService
    ) {
        // Handle ended event on audio element
        this.controls.$onEnded.pipe(switchMap(() => this.next())).subscribe();
    }

    public readonly $isPaused = this.controls.$isPaused;


    public playNext(entity: any, tracklist: SCNGXTracklist, startIndex: number = 0): Observable<number> {
        return new Observable((subscriber) => {
            const resource: ResourceWithTracklist<PlayableItem> = {
                ...entity,
                tracklist: tracklist,
                startIndex: startIndex
            }
    
            const positionInQueue = this.queue.enqueue(resource);
            console.log(`Enqueued tracklist entity at position ${positionInQueue}`);

            // TODO: Need a method to dequeue an item at index "startIndex"

            // Check if player is idling
            if(this.isIdle) {
                // If true, play next()
                this.next().subscribe();
            }

            subscriber.next(positionInQueue);
            subscriber.complete();
        });
    }

    public forcePlay(entity: any, tracklist: SCNGXTracklist, startIndex: number = 0) {
        return new Observable((subscriber) => {
            const resource: ResourceWithTracklist<PlayableItem> = {
                ...entity,
                tracklist: tracklist,
                startIndex: startIndex
            }
    
            const positionInQueue = this.queue.enqueue(resource);
            // TODO: Need a method to dequeue an item at index "startIndex" and play it here immediately
            this.next().subscribe();

            subscriber.next(positionInQueue);
            subscriber.complete();
        });
    }

    /**
     * Skip currently playing track
     * @returns URL of the next playing song
     */
    public skip(): Observable<string> {
        return this.next();
    }

    /**
     * Set play to paused or playing based on the current state
     * @returns rue, if the player is now playing. Otherwise false
     */
    public togglePlaying(): Observable<boolean> {
        return of(this.controls.togglePlaying());
    }

    /**
     * Check if the player is idling. If true, it means
     * there is nothing playing
     */
    public get isIdle(): boolean {
        return isNull(this.currentItem.getValue());
    }

    /**
     * Get the url to the stream that is currently playing
     */
    public get currentUrl(): string {
        return this.currentItem.getValue()?.url;
    }

    private next(): Observable<string> {
        // Resource can be Album, Song, Playlist etc.
        const nextResource = this.queue.dequeue();
        // If the resource is null, the queue is completely empty
        if(isNull(nextResource)) {
            // Because this could mean a skip is tried, just skip to end of current song
            this.controls.resetCurrentlyPlaying(true);
            return of(null);
        }

        // Get next item
        return nextResource.tracklist.getNextItem().pipe(
            switchMap((item) => {
                // If the next item is null, the tracklist is empty
                // So we have to skip to the end of the track and let it start
                // from beginning if play is hit
                if(isNull(item)) {
                    this.controls.resetCurrentlyPlaying(true);
                    return of(null);
                }

                // Request stream url
                return this.streamService.requestStreamUrl(item.id, true).pipe(tap((url) => {
                    // Update current item
                    this.currentItem.next({ ...item, url: url });
                }));
            }),
            // Start playing the item
            switchMap((url) => {
                if(isNull(url)) return of(this.currentUrl);
                return this.controls.play(url);
            }),
            // Print url
            tap((url) => console.log(`Now streaming ${url}`)),
            take(1)
        );
    }

}