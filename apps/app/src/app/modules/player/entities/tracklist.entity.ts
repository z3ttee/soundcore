import { Future, PlayableEntity, Song } from "@soundcore/sdk";
import { SCNGXBaseTracklist } from "./tracklist-base.entity";
import { HttpClient } from "@angular/common/http";
import { Observable, filter } from "rxjs";
import { isNull } from "@soundcore/common";

/**
 * Tracklist class to handle tracklists by providing an integrated queueing system
 * @template T Type of the items inside the tracklist
 */
export class SCNGXTracklist extends SCNGXBaseTracklist<SCNGXTracklist, Song> {

    private constructor(
        /**
         * Entity to which the tracklist belongs. This can for example
         * be an artist or album
         */
        owner: PlayableEntity,
        /**
         * Base URL used to build url for fetching
         * new items
         */
        apiBaseUrl: string,
        /**
         * HttpClient instance to perform
         * http requests.
         */
        httpClient: HttpClient,
        /**
         * Index of track to start playback at.
         * This will be ignored when shuffle is on
         */
        startAt?: string | number,
        /**
         * Define if the tracklist should be shuffled upon creation
         */
        generateShuffled?: boolean
    ) {
        super(owner, apiBaseUrl, httpClient, startAt, generateShuffled);
    }

    public static create(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, generateShuffled?: boolean): Observable<Future<SCNGXTracklist>>;
    public static create(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAt?: number | string): Observable<Future<SCNGXTracklist>>;
    public static create(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAt?: number | string, generateShuffled?: boolean): Observable<Future<SCNGXTracklist>>;
    /**
     * Create a new tracklist instance
     * @param apiBaseUrl Base url to the API service
     * @param httpClient HttpClient to send http requests with
     * @param ownerId Id of the related resource to which the tracklist belongs. This can for example be an album, artist etc.
     * @param ownerType Type of the related resource to which the tracklist belongs. This can for example be an album ("album"), artist ("artist") etc.
     * @param startAtIndex Index of track to start playback at
     * @param generateShuffled Seed to use when generating shuffled tracklists
     */
    public static create(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAtOrShuffle?: (number | string) | boolean, generateShuffled?: boolean): Observable<Future<SCNGXTracklist>> {
        return new Observable((subscriber) => {
            // Check if owner is null
            if(isNull(owner)) {
                // If true, return 404 Future
                subscriber.next(Future.notfound());
                subscriber.complete();
                return;
            }

            const startAt = typeof startAtOrShuffle === "number" || typeof startAtOrShuffle === "string" ? startAtOrShuffle : undefined;
            const shuffle = typeof startAtOrShuffle === "boolean" ? startAtOrShuffle : (generateShuffled ?? false) 

            // Send loading state first
            subscriber.next(Future.loading());
            // Create new tracklist instance
            const tracklist = new SCNGXTracklist(owner, apiBaseUrl, httpClient, startAt, shuffle);
            // Subscribe to ready state and wait till tracklist is ready
            subscriber.add(tracklist.$ready.pipe(filter((isReady) => isReady)).subscribe(() => {
                // If tracklist emitted ready=true, resolve future with tracklist data
                subscriber.next(Future.of(tracklist));
                // Complete the observable
                subscriber.complete();
            }));
        });
    }

    protected override dequeue() {
        // Check if the pointer already is at the end of the tracklist
        // If true, return null
        if(this.hasEnded) return null;
        return this._queue.dequeue();
    }

}