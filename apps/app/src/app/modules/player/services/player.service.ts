import { Injectable } from "@angular/core";
import { isNull } from "@soundcore/common";
import { LikedSong, PlaylistItem, SCSDKStreamService, Song, TracklistV2 } from "@soundcore/sdk";
import { BehaviorSubject, map, Observable, of, switchMap, take, tap } from "rxjs";
import { ResourceWithTracklist } from "../entities/resource-with-tracklist.entity";
import { SCNGXTracklist } from "../entities/tracklist.entity";
import { AudioController } from "./controls.service";
import { AudioQueue } from "./queue.service";

export type PlayableItem = Song & PlaylistItem & LikedSong

export type Streamable = PlayableItem & {
    url: string;
    tracklist: Pick<TracklistV2, "id">
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

    /**
     * Add an entity to the queue. Playback will start if the audio element asks for 
     * new track or if the queue is currently empty
     * @param entity Entity (e.g. Album) to play
     * @param tracklist Tracklist that belongs to that entity
     * @param startIndex Index to start at. Defaults to 0
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public playNext(entity: any, tracklist: SCNGXTracklist, startIndex: number = 0): Observable<number> {
        return this.toggleIfActive(tracklist).pipe(
            switchMap((isActive) => {
                if(isActive) return of(-1);

                const resource: ResourceWithTracklist<PlayableItem> = {
                    ...entity,
                    tracklist: tracklist,
                    startIndex: startIndex
                }
        
                const positionInQueue = this.queue.enqueue(resource);
                // TODO: Need a method to dequeue an item at index "startIndex" and play it here immediately
                return (this.isIdle ? this.next() : of()).pipe(map(() => positionInQueue));
            }),
        );
    }

    /**
     * Force play an entity
     * @param entity Entity (e.g. Album) to play
     * @param tracklist Tracklist that belongs to that entity
     * @param startIndex Index to start at
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public forcePlay(entity: any, tracklist: SCNGXTracklist): Observable<number> {
        return this.toggleIfActive(tracklist).pipe(
            switchMap((isActive) => {
                if(isActive) return of(-1);

                const resource: ResourceWithTracklist<PlayableItem> = {
                    ...entity,
                    tracklist: tracklist
                }
        
                const positionInQueue = this.queue.enqueue(resource);
                return this.next().pipe(map(() => positionInQueue));
            }),
        );
    }

    /**
     * Force play an entity
     * @param entity Entity (e.g. Album) to play
     * @param tracklist Tracklist that belongs to that entity
     * @param indexAt Index to start at
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public forcePlayAt(entity: any, tracklist: SCNGXTracklist, indexAt: number): Observable<number> {
        // return this.toggleIfActive(tracklist).pipe(
        //     switchMap((isActive) => {
        //         if(isActive && isNull(indexAt)) return of(-1);

        //         const resource: ResourceWithTracklist<PlayableItem> = {
        //             ...entity,
        //             tracklist: tracklist
        //         }
        
        //         const positionInQueue = this.queue.enqueue(resource);
        //         return this.next(indexAt).pipe(map(() => positionInQueue));
        //     }),
        // );

        // const resource: ResourceWithTracklist<PlayableItem> = {
        //     ...entity,
        //     tracklist: tracklist
        // }

        // const positionInQueue = this.queue.enqueue(resource);
        return this.next(indexAt).pipe(map(() => 0));
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

    /**
     * Get the tracklist id of the currently playing item
     */
    public get currentTracklistId(): string {
        return this.currentItem.getValue()?.tracklist?.id;
    }

    /**
     * Toggle the playback of a tracklist if it is active.
     * @param tracklist Tracklist entity
     * @returns True, if tracklist is active and state has changed. Otherwise false, if the tracklist currently is not active
     */
    public toggleIfActive(tracklist: SCNGXTracklist): Observable<boolean> {
        // Check if the tracklist is playing currently
        if(this.currentTracklistId == tracklist.id) {
            // If true, the user may have clicked the play button again to
            // pause the audio. So pause it
            return this.togglePlaying().pipe(map(() => true));
        }

        return of(false);
    }

    private next(index?: number): Observable<string> {
        console.log(index);

        // If index is set, get the tracklist from queue. Otherwise just do normal dequeue()

        // Resource can be Album, Song, Playlist etc.
        const nextResource = this.queue.dequeue();

        // If the resource is null, the queue is completely empty
        if(isNull(nextResource)) {
            // Because this could mean a skip is tried, just skip to end of current song
            this.controls.resetCurrentlyPlaying(true);
            return of(null);
        }

        // Get next item
        return nextResource.tracklist.getNextItem(index).pipe(
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
                    this.setCurrentItem(item, url, nextResource.tracklist.id);
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

    /**
     * Update currently playing item
     * @param item Entity that is playing
     * @param url Url that is playing
     * @param tracklistId Tracklist instance id that is playing
     */
    private setCurrentItem(item: PlayableItem, url: string, tracklistId: string) {
        this.currentItem.next({ 
            ...item, 
            url: url,
            tracklist: {
                id: tracklistId
            }
        });
    }
}