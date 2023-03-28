import { Injectable } from "@angular/core";
import { isNull, toVoid } from "@soundcore/common";
import { LikedSong, PlaylistItem, SCSDKStreamService, Song } from "@soundcore/sdk";
import { BehaviorSubject, map, Observable, of, switchMap, take, tap } from "rxjs";
import { ResourceWithTracklist } from "../entities/resource-with-tracklist.entity";
import { SCNGXTracklist } from "../entities/tracklist.entity";
import { AudioController } from "./controls.service";
import { AudioQueue } from "./queue.service";

export type PlayableItem = Song & PlaylistItem & LikedSong

export type Streamable = PlayableItem & {
    url: string;
    tracklistId?: string;
    // tracklist: Pick<TracklistV2, "id">
}

@Injectable({
    providedIn: "root"
})
export class PlayerService {

    /**
     * Subject used to control the $currentItem observable.
     * This is used to push new state.
     */
    private readonly currentItem: BehaviorSubject<Streamable> = new BehaviorSubject(null);
    /**
     * Observable that emits the currently playing item
     */
    public readonly $currentItem = this.currentItem.asObservable();

    /**
     * Subject used to control the shuffle state of a player.
     * If the value changes, the current queue will be reconstructed to use the
     * new seed to create tracklists etc.
     */
    private readonly playerSeed: BehaviorSubject<string> = new BehaviorSubject(null);
    /**
     * Observable that emits if the player is currently shuffled.
     */
    public readonly $isShuffled: Observable<boolean> = this.playerSeed.asObservable().pipe(map((seed) => !isNull(seed)));

    // TODO: Loading should be set every time a new song is loading (should start on next() and end when player gives feedback that the song is actually playing)
    private readonly isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly $isLoading = this.isLoading.asObservable();

    /**
     * Observable that emits the current playback state.
     * Emits true, if the player is paused
     * Emits false, if the player is playing
     */
    public readonly $isPaused = this.controls.$isPaused;

    constructor(
        private readonly queue: AudioQueue,
        private readonly controls: AudioController,
        private readonly streamService: SCSDKStreamService
    ) {
        // Handle ended event on audio element
        this.controls.$onEnded.pipe(switchMap(() => this.next())).subscribe();
    }


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
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public forcePlay(entity: any, tracklist?: SCNGXTracklist): Observable<void> {
        // Check if the entity was enqueued with a tracklist.
        // This means, that the entity may not be a single song
        if(!isNull(tracklist)) {
            return this.forcePlayAt(entity, tracklist, 0).pipe(toVoid());
        }

        // This will enqueue the entity on top, if its
        // a single song
        this.queue.enqueue(entity);
        // Play next in queue (should be the enqueued new entity)
        return this.next().pipe(toVoid());
    }

    /**
     * Force play an entity
     * @param entity Entity (e.g. Album) to play
     * @param tracklist Tracklist that belongs to that entity
     * @param indexAt Index to start at
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public forcePlayAt(entity: any, tracklist: SCNGXTracklist, indexAt: number): Observable<any> {
        // Check if not enqueued, if true, enqueue tracklist
        if(!this.queue.isEnqueued(tracklist.id)) {
            // Enqueue entity as tracklist
            this.queue.enqueue({
                ...entity,
                tracklist: tracklist
            });
        }
        
        // Get enqueued tracklist by specified id
        const enqueuedTracklist = this.queue.findTracklistById(tracklist.id)?.data?.tracklist;
        return this.nextFromTracklist(enqueuedTracklist, indexAt);
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
        return this.currentItem.getValue()?.tracklistId;
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

    private nextFromTracklist(tracklist: SCNGXTracklist<PlayableItem>, indexInTracklist?: number): Observable<string> {
        return tracklist.getNextItem(indexInTracklist).pipe(
            switchMap((item): Observable<string> => {
                // If the next item is null, the tracklist is empty
                // So we have to skip to the end of the track and let it start
                // from beginning if play is hit
                if(isNull(item)) {
                    // this.controls.resetCurrentlyPlaying(true);
                    return of(null);
                }

                // If current item is already playing, toggle play state
                if(this.isPlaying(item.id, tracklist.id)) {
                    return this.togglePlaying().pipe(map(() => null));
                }

                // Extract correct song object from item
                const song = item.song ?? item as Song;
                // Request stream url
                return this.streamService.requestStreamUrl(song.id, true).pipe(tap((url) => {
                    // Update current item
                    this.setCurrentItem(item, url, tracklist.id);
                }));
            }),
            // Start playing the item
            switchMap((url) => {
                if(isNull(url)) return of(this.currentUrl);
                return this.controls.play(url);
            }),
            // Print url
            tap((url) => {
                if(!isNull(url)) console.log(`Now streaming ${url}`)
            }),
        )
    }

    private next(index?: number): Observable<string> {
        return new Observable<[PlayableItem, SCNGXTracklist<PlayableItem>]>((subscriber) => {
            // Dequeue next item from queue
            const nextItem = this.queue.dequeue();

            // If the resource is null, the queue is completely empty
            if(isNull(nextItem)) {
                // Because this could mean a skip is tried, just skip to end of current song
                this.controls.resetCurrentlyPlaying(true);
                subscriber.next([null, null]);
                subscriber.complete();
                return;
            }

            // Check if the item is not a list of tracks
            if(!nextItem.isList) {
                // If true, return song
                const data = nextItem.data as PlayableItem;
                subscriber.next([data, null]);
                subscriber.complete();
                return;
            }

            const data = nextItem.data as ResourceWithTracklist<PlayableItem>;

            subscriber.add(data.tracklist.getNextItem(index).subscribe((item) => {
                subscriber.next([item, data.tracklist]);
                subscriber.complete();
            }));
        }).pipe(
            switchMap(([item, tracklist]) => {
                // If the next item is null, the tracklist is empty
                // So we have to skip to the end of the track and let it start
                // from beginning if play is hit
                if(isNull(item)) {
                    // this.controls.resetCurrentlyPlaying(true);
                    return of(null);
                }

                // Extract correct song object from item
                const song = item.song ?? item as Song;
                // Request stream url
                return this.streamService.requestStreamUrl(song.id, true).pipe(tap((url) => {
                    // Update current item
                    this.setCurrentItem(item, url, tracklist.id);
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
    private setCurrentItem(item: PlayableItem, url: string, tracklistId?: string) {
        this.currentItem.next({ 
            ...item, 
            url: url,
            tracklistId: tracklistId ?? undefined
        });
    }

    private isPlaying(songId: string, tracklistId?: string): boolean {
        const current = this.currentItem.getValue();
        if(isNull(current)) return false;
        return current.id === songId && current.tracklistId === tracklistId;
    }

    private isTracklistPlaying(tracklistId: string): boolean {
        const current = this.currentItem.getValue();
        if(isNull(current)) return false;
        return current.tracklistId === tracklistId;
    }
}