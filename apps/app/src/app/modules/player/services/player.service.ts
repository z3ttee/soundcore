import { Injectable } from "@angular/core";
import { isNull, toVoid } from "@soundcore/common";
import { LikedSong, PlayableEntity, PlayableEntityType, PlaylistItem, SCSDKStreamService, Song } from "@soundcore/sdk";
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, switchMap, take, tap } from "rxjs";
import { SCNGXTracklist } from "../entities/tracklist.entity";
import { AudioQueue } from "./queue.service";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { AudioManager } from "../managers/audio-manager";
import { VolumeManager } from "../managers/volume-manager";
import { ShuffleManager } from "../managers/shuffle-manager";

export type PlayableItem = Song & PlaylistItem & LikedSong

export type Streamable = Song & {
    url: string;
    owner?: PlayableEntity;
}

@Injectable({
    providedIn: "root"
})
export class PlayerService {
    private readonly audioManager = new AudioManager();
    private readonly volumeManager = new VolumeManager(this.audioManager.audioElement);
    private readonly shuffleManager = new ShuffleManager();

    /**
     * Subject used to control the $currentItem observable.
     * This is used to push new state.
     */
    private readonly currentItem: BehaviorSubject<Streamable> = new BehaviorSubject(null);
    /**
     * Observable that emits the currently playing item
     */
    public readonly $currentItem = this.currentItem.asObservable().pipe(distinctUntilChanged());

    // TODO: Loading should be set every time a new song is loading (should start on next() and end when player gives feedback that the song is actually playing)
    private readonly isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly $isLoading = this.isLoading.asObservable();

    /**
     * Observable that emits the current playback state.
     * Emits true, if the player is paused
     * Emits false, if the player is playing
     */
    public readonly $isPaused = this.audioManager.$isPaused;
    public readonly $currentTime = this.audioManager.$currenTime;

    public readonly $volume = this.volumeManager.$volume;
    public readonly $isMuted = this.volumeManager.$muted;
    public readonly $shuffled = this.shuffleManager.$shuffled;

    public readonly $queue = this.queue.$queue.pipe(distinctUntilChanged());
    public readonly $queueSize = this.$queue.pipe(map(([queue, tracklist]) => (queue?.length ?? 0) + (tracklist?.queue?.length ?? 0)), distinctUntilChanged());

    constructor(
        private readonly queue: AudioQueue,
        private readonly streamService: SCSDKStreamService,
        private readonly httpClient: HttpClient
    ) {
        // Handle ended event on audio element
        this.audioManager.$onEnded.pipe(switchMap(() => this.next())).subscribe();
        // Subscribe to shuffle state changes and forward to queue
        this.shuffleManager.$shuffled.subscribe((shuffled) => this.queue.setShuffled(shuffled));
    }

    /**
     * Toggle shuffle mode. This will generate
     * a new seed for the player each time the shuffle mode
     * is switched on again.
     * @returns State after switching shuffle mode. True, if shuffle is now on, false if shuffle was turned off
     */
    public toggleShuffle() {
        this.shuffleManager.toggleShuffled();
    }

    /**
     * Seek on the track
     * @param seconds Second to seek
     */
    public seek(seconds: number) {
        this.audioManager.seek(seconds);
    }

    /**
     * Add an entity to the queue. Playback will start if the audio element asks for 
     * new track or if the queue is currently empty
     * @param entity Entity (e.g. Album) to play
     * @param tracklist Tracklist that belongs to that entity
     * @param startIndex Index to start at. Defaults to 0
     * @returns True, if the entity was enqueued, otherwise false
     */
    public playNext(entity: PlayableEntity): Observable<boolean> {
        return this.toggleIfActive(entity).pipe(
            switchMap((isActive) => {
                // If entity is already playing, the playback state just changed
                // and nothing needs to be done
                if(isActive) return of(false);
                // Otherwise enqueue entity
                const result = this.queue.enqueue(entity as PlayableItem);
                // Play next
                return of(result != -1);
            })
        );

        // // If is song, always enqueue
        // if(entity.type === PlayableEntityType.SONG) {
        //     return this.toggleIfActive(entity).pipe(
        //         switchMap((isActive) => {
        //             // If entity is already playing, the playback state just changed
        //             // and nothing needs to be done
        //             if(isActive) return of(null);

        //             // Otherwise enqueue entity as song
        //             this.queue.enqueue(entity as PlayableItem);
        //             // Play next
        //             return of(null);
        //         }),
        //         toVoid()
        //     );
        // }
        
        // return this.toggleIfActive(tracklist).pipe(
        //     switchMap((isActive) => {
        //         if(isActive) return of(-1);

        //         const resource: ResourceWithTracklist<PlayableItem> = {
        //             ...entity,
        //             tracklist: tracklist,
        //         }
        
        //         const positionInQueue = this.queue.enqueue(resource);
        //         // TODO: Need a method to dequeue an item at index "startIndex" and play it here immediately
        //         return (this.isIdle ? this.next() : of()).pipe(map(() => positionInQueue));
        //     }),
        // );
    }

    /**
     * Force play an entity
     * @param entity Entity (e.g. Album) to play
     * @param tracklist Tracklist that belongs to that entity
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public forcePlay(entity: PlayableEntity): Observable<void> {
        // If is song, always enqueue
        if(entity.type === PlayableEntityType.SONG) {
            return this.toggleIfActive(entity).pipe(
                switchMap((isActive) => {
                    // If entity is already playing, the playback state just changed
                    // and nothing needs to be done
                    if(isActive) return of(null);

                    // Otherwise enqueue entity as song
                    this.queue.enqueue(entity as PlayableItem);
                    // Play next
                    return this.next().pipe(toVoid());
                }),
                toVoid()
            );
        }

        // Entity is a tracklist
        return this.toggleIfActive(entity).pipe(
            switchMap((isActive) => {
                // If entity is already playing, the playback state just changed
                // and nothing needs to be done
                if(isActive) return of(null);

                return SCNGXTracklist.create(entity, `${environment.api_base_uri}`, this.httpClient, this.shuffleManager.isShuffled).pipe(
                    filter(({loading}) => !loading),
                    switchMap((request) => {
                        const data = request.data;
                        if(isNull(data)) return of(null);
    
                        // Enqueue tracklist and abort if the item was not enqueued
                        if(this.queue.enqueue(data) <= -1) {
                            // Release resources
                            data.release();
                            return of(null);
                        }
    
                        // Find enqueued tracklist (because it may have different obj ref)
                        const tracklist = this.queue.getEnqueuedTracklist();
                        // Play next from tracklist
                        return this.next(tracklist);
                    })
                );
            }),
            toVoid()
        );
    }

    /**
     * Force play an entity
     * @param entity Entity (e.g. Album) to play
     * @param indexAt Index to start at
     * @param itemId Id of the item to play at
     * @returns Position in queue (-1 if the tracklist is currently playing and therefor paused state changed)
     */
    public forcePlayAt(entity: PlayableEntity, indexAt: number, itemId: string): Observable<void> {
        return of(null).pipe(
            switchMap(() => {
                console.log(entity);
                // Throw error, if unsupported entity type for forcePlayAt.
                if(entity.type === PlayableEntityType.SONG) throw new Error(`Cannot call forcePlayAt() on song entities (type=${PlayableEntityType.SONG.toLowerCase()})`);
                // Initialize tracklist request
                let tracklistRequest: Observable<SCNGXTracklist> = of(null);

                // Extract tracklist id
                const tracklistId = entity.id;
                // Extract enqueue status of tracklistId
                const isEnqueued = this.queue.isEnqueued(tracklistId);
                const isShuffled = this.shuffleManager.isShuffled;

                // Check if is already enqueued
                if(isEnqueued) {
                    // If true, find tracklist
                    const enqueuedTracklist = this.queue.getEnqueuedTracklist();
                    if(isNull(enqueuedTracklist)) return of(null);

                    // Check if requested index is already playing
                    if(enqueuedTracklist.isPlayingById(itemId)) {
                        // If true, toggle playback state and return
                        return this.togglePlaying().pipe(switchMap(() => tracklistRequest));
                    }

                    // Restart tracklist using indexAt
                    if(isShuffled) {
                        tracklistRequest = enqueuedTracklist.restart(itemId, this.shuffleManager.isShuffled);
                    } else {
                        tracklistRequest = enqueuedTracklist.restart(indexAt, this.shuffleManager.isShuffled);
                    }
                } else {
                    // Otherwise create new tracklist
                    if(isShuffled) {
                        tracklistRequest = SCNGXTracklist.create(entity, `${environment.api_base_uri}`, this.httpClient, itemId, isShuffled).pipe(filter(({ loading }) => !loading), map((request) => request.data));
                    } else {
                        tracklistRequest = SCNGXTracklist.create(entity, `${environment.api_base_uri}`, this.httpClient, indexAt, isShuffled).pipe(filter(({ loading }) => !loading), map((request) => request.data));
                    }
                }

                return tracklistRequest;
            }),
            switchMap((tracklist) => {
                if(isNull(tracklist)) return of(null);

                // Check if not enqueued, if true, enqueue tracklist
                if(!this.queue.isEnqueued(tracklist.id)) {
                    // Enqueue entity as tracklist
                    this.queue.enqueue(tracklist);
                }

                // Get enqueued tracklist by specified id
                const enqueuedTracklist = this.queue.getEnqueuedTracklist();
                return this.next(enqueuedTracklist);
            }),
            toVoid()
        );
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
        return this.audioManager.togglePlaying();
    }

    public toggleMute() {
        this.volumeManager.toggleMute();
    }

    public setVolume(volume: number): void {
        this.volumeManager.setVolume(volume);
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

    public get currentItemId(): string {
        return this.currentItem.getValue()?.id;
    }

    /**
     * Get the tracklist id of the currently playing item
     */
    public get currentTracklistId(): string {
        return this.currentItem.getValue()?.owner?.id;
    }

    /**
     * Toggle the playback of a tracklist if it is active.
     * @param tracklist Tracklist entity
     * @returns True, if tracklist is active and state has changed. Otherwise false, if the tracklist currently is not active
     */
    public toggleIfActive(item: PlayableEntity): Observable<boolean> {
        // Check if the tracklist is playing currently
        if(this.currentTracklistId === item.id || this.currentItemId === item.id) {
            // If true, the user may have clicked the play button again to
            // pause the audio. So pause it
            return this.togglePlaying().pipe(map(() => true));
        }

        return of(false);
    }
    private next(): Observable<string>;
    private next(tracklist?: SCNGXTracklist): Observable<string>;
    private next(tracklist?: SCNGXTracklist): Observable<string> {
        return new Observable<[Song, SCNGXTracklist]>((subscriber) => {
            // Check if a tracklist is provided
            if(isNull(tracklist)) {
                // If not, continue normally by dequeueing from tracks
                // Dequeue next item from queue
                const nextItem = this.queue.dequeue();

                // If the resource is null, the queue is completely empty
                if(isNull(nextItem)) {
                    // Because this could mean a skip is tried, just skip to end of current song
                    this.audioManager.resetCurrentlyPlaying(true);
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

                // Treat data as tracklist (as its the only other option at this point)
                const data = nextItem.data as SCNGXTracklist;
                // Add next-query to subscriber
                subscriber.add(data.getNextItem().subscribe((item) => {
                    // Emit result on subscriber
                    subscriber.next([item, data]);
                    subscriber.complete();
                }));
                return;
            }
            
            // Otherwise dequeue from provided tracklist
            subscriber.add(tracklist.getNextItem().pipe(switchMap((item): Observable<Song> => {
                // If current item is already playing, toggle play state
                if(this.isPlaying(item?.id, tracklist.id)) {
                    return this.togglePlaying().pipe(map(() => null));
                }

                return of(item);
            })).subscribe((item) => {
                // Push result
                subscriber.next([item, tracklist]);
                // Complete subscription
                subscriber.complete();
            }));
        }).pipe(
            switchMap(([item, tracklist]) => {
                // If the next item is null, the tracklist is empty
                // So we have to skip to the end of the track and let it start
                // from beginning if play is hit
                if(isNull(item)) {
                    this.audioManager.resetCurrentlyPlaying(true);
                    return of(null);
                }

                // Request stream url
                return this.streamService.requestStreamUrl(item.id, true).pipe(tap((url) => {
                    // Update current item
                    this.setCurrentItem(item, url, tracklist?.owner);
                }));
            }),
            // Start playing the item
            switchMap((url) => {
                if(isNull(url)) return of(this.currentUrl);
                // return this.controls.play(url);
                return this.audioManager.play(url);
            }),         
            take(1)
        );
    }

    // private nextFromTracklist(tracklist: SCNGXTracklist): Observable<string> {
    //     return tracklist.getNextItem().pipe(
    //         switchMap((item): Observable<string> => {
    //             // If the next item is null, the tracklist is empty
    //             // So we have to skip to the end of the track and let it start
    //             // from beginning if play is hit
    //             if(isNull(item)) {
    //                 this.controls.resetCurrentlyPlaying(true);
    //                 return of(null);
    //             }

    //             // If current item is already playing, toggle play state
    //             if(this.isPlaying(item.id, tracklist.id)) {
    //                 return this.togglePlaying().pipe(map(() => null));
    //             }

    //             // Request stream url
    //             return this.streamService.requestStreamUrl(item.id, true).pipe(tap((url) => {
    //                 // Update current item
    //                 this.setCurrentItem(item, url, tracklist.id);
    //             }));
    //         }),
    //         // Start playing the item
    //         switchMap((url) => {
    //             if(isNull(url)) return of(null);
    //             return this.controls.play(url);
    //         })
    //     )
    // }

    /**
     * Update currently playing item
     * @param item Entity that is playing
     * @param url Url that is playing
     * @param tracklistId Tracklist instance id that is playing
     * @param tracklistIndex Index in tracklist
     */
    private setCurrentItem(item: Song, url: string, owner: PlayableEntity) {
        this.currentItem.next({ 
            ...item, 
            url: url,
            owner: owner ?? undefined,
        });
    }

    private isPlaying(songId: string, tracklistId?: string): boolean {
        const current = this.currentItem.getValue();
        if(isNull(current)) return false;
        return current.id === songId && current.owner?.id === tracklistId;
    }

}