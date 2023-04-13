import { HttpClient } from "@angular/common/http";
import { ApiError, Future, PlayableEntity, toFuture, TracklistV2 } from "@soundcore/sdk";
import { isNull, isString, Page, Pageable } from "@soundcore/common";
import { BehaviorSubject, filter, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from "rxjs";
import { Queue } from "./queue";
import { Cache } from "./cache";
import { PlayableItem } from "../services/player.service";

export type TracklistWithoutItems = Omit<TracklistV2<PlayableItem>, "items">;
export const PAGE_SIZE = 30;

/**
 * Tracklist class to handle tracklists by providing an integrated queueing system
 * @template T Type of the items inside the tracklist
 */
export class SCNGXTracklist {

    private readonly $cancel: Subject<void> = new Subject();
    /**
     * Subject to manage emition of 
     * release process
     */
    private readonly $onRelease: Subject<void> = new Subject();
    /**
     * Subject to manage emition 
     * of errors
     */
    private readonly error: Subject<ApiError> = new Subject();
    /**
     * Subscribe to errors that 
     * occur on the tracklist
     */
    public readonly $error = this.error.asObservable().pipe(takeUntil(this.$onRelease));

    private readonly queue: Queue<PlayableItem> = new Queue();
    private readonly cache: Cache<PlayableItem> = new Cache();

    private readonly metadataSubject: BehaviorSubject<TracklistWithoutItems> = new BehaviorSubject(null);
    public readonly $metadata = this.metadataSubject.asObservable().pipe(takeUntil(this.$cancel));

    /**
     * Observable that emits ready state. A tracklist is considered ready, when all
     * metadata has been fetched. When restarting or shuffling a playlist, metadata will be fetched
     * again causing this observable to switch values.
     */
    public readonly $ready: Observable<boolean> = this.$metadata.pipe(map((metadata) => !isNull(metadata)));

    private constructor(
        /**
         * Entity to which the tracklist belongs. This can for example
         * be an artist or album
         */
        private readonly owner: PlayableEntity,
        /**
         * Base URL used to build url for fetching
         * new items
         */
        private readonly apiBaseUrl: string,
        /**
         * HttpClient instance to perform
         * http requests.
         */
        private readonly httpClient: HttpClient,
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
        if(isString(startAt)) {
            this.restart(startAt as string, generateShuffled).subscribe();
        } else {
            this.restart(startAt as number, generateShuffled).subscribe();
        }
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

    /**
     * Get current metadata snapshot
     */
    protected get metadata() {
        return this.metadataSubject.getValue();
    }

    /**
     * Type of the tracklist. This equals
     * to the type of the owner to which 
     * the tracklist belongs
     */
    public get type() {
        return this.metadata.type
    }

    /**
     * Id of the tracklist. This equals
     * to the id of the owner to which 
     * the tracklist belongs
     */
    public get id() {
        return this.metadata.id;
    }

    /**
     * Get the seed that is used to 
     * create shuffled tracklists
     */
    public get seed(): number {
        return this.metadata?.seed;
    }

    /**
     * Get the size of the tracklist
     */
    public get size(): number {
        return this.metadata?.size;
    }

    /**
     * Check if the tracklist is empty
     */
    public get isEmpty(): boolean {
        return this.metadata?.size <= 0;
    }

    /**
     * Check if the tracklist is not empty
     */
    public get isNotEmpty(): boolean {
        return !this.isEmpty;
    }

    /**
     * Check if all items have been fetched
     * from the api (items are only fetched when needed)
     */
    public get hasFetchedAll() {
        // return this.items.length >= this.size;
        return this.cache.length >= this.size;
    }

    /**
     * Check if the tracklist reached end of playback.
     * This is true, if the tracklist is empty (has no items)
     * or the internal queue reached end of the list of items
     */
    public get hasEnded() {
        return this.isEmpty || this.queue.size <= 0;
    }

    /**
     * Check if the next page should be fetched
     * This is true, when the current queue pointer is near the end of fetched items count
     */
    private get shouldFetchNext() {
        return !this.hasFetchedAll && this.queue.size <= 8
    }

    /**
     * Restart the tracklist
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(generateShuffled: boolean): Observable<SCNGXTracklist>;
    /**
     * Restart the tracklist
     * @param startAtIndex Index in tracklist where the tracklist should start
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(startAtIndex: number, generateShuffled?: boolean): Observable<SCNGXTracklist>;
    /**
     * Restart the tracklist
     * @param startWithId Id of the item in tracklist where the tracklist should start
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(startWithId: string, generateShuffled?: boolean): Observable<SCNGXTracklist>;
    public restart(startAtIndexOrgenerateShuffledOrStartWithId: number | boolean | string, generateShuffled?: boolean): Observable<SCNGXTracklist> {
        // Extract info if tracklist should be shuffled
        const shouldGenerateShuffled: boolean = typeof startAtIndexOrgenerateShuffledOrStartWithId === "boolean" ? (startAtIndexOrgenerateShuffledOrStartWithId || generateShuffled) : (generateShuffled ?? false);
        const startAt: number = typeof startAtIndexOrgenerateShuffledOrStartWithId === "number" ? startAtIndexOrgenerateShuffledOrStartWithId : 0;
        const startWithId: string = typeof startAtIndexOrgenerateShuffledOrStartWithId === "string" ? startAtIndexOrgenerateShuffledOrStartWithId : undefined;

        // Update current startAt
        // this.startAtIndex = startAt;

        // Cancel all ongoing requests
        this.$cancel.next();
        // Clear current metadata. This will also
        // cause the ready state to switch to false
        this.metadataSubject.next(null);
        // Clear cached items
        this.cache.clear();
        // Clear enqueued items
        this.queue.clear();

        // Fetch metadata
        return this.fetchMetadata(this.owner, startAt, startWithId, shouldGenerateShuffled).pipe(
            takeUntil(this.$cancel),
            filter((request) => !request.loading),
            map((request) => {
                // Publish error if exists
                if(request.error) {
                    this.publishError(request.error);
                    return null;
                }

                const metadata = request.data;
                if(isNull(metadata)) return null;

                // Cache first page from metadata object
                this.cache.set(0, metadata.items);
                // Enqueue first page from metadata object
                this.queue.enqueue(metadata.items.items)
                // Remove page from metadata
                metadata.items = undefined;
                // Save metadata by pushing to subject
                this.metadataSubject.next(metadata);
                return this;
            }),
            tap((val) => {
                console.log("Tracklist restarted");
            })
        );
    }

    /**
     * Rebuild the tracklist based on if it should be shuffled or not
     * @param shuffled Shuffle the tracklist
     */
    public reshuffle(shuffled: boolean) {
        return this.restart(shuffled);
    }

    /**
     * Check if an item with specified id is currently playing
     * @param itemId Id of the target item
     */
    public isPlayingById(itemId: string) {
        if(isNull(itemId)) return false;
        return this.queue.lastDequeuedItem.id === itemId;
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem(): Observable<PlayableItem> {
        return this.$ready.pipe(
            filter((isReady) => isReady),
            take(1),
            takeUntil(this.$cancel),
            switchMap(() => {
                return new Observable<PlayableItem>((subscriber) => {        
                    // If next page should be fetched
                    if(this.shouldFetchNext) {
                        // If true, fetch page
                        subscriber.add(this.getNextItems().pipe(takeUntil(this.$cancel)).subscribe(() => {
                            // After fetching next items, dequeue next item
                            subscriber.next(this.dequeue());
                            subscriber.complete();
                        }));
                        return;
                    }
        
                    // If false, return next item
                    subscriber.next(this.dequeue());
                    subscriber.complete();
                }).pipe(
                    // Because an item was dequeued, it means the 
                    // tracklist started playing
                    // tap(() => this.didStartPlaying = true),
                    // Only emit once, so the subscription 
                    // is terminated after the first result
                    take(1)
                );
            }),
            takeUntil(this.$cancel)
        );
    }

    /**
     * Release used resources. This will cause
     * all listeners to be unsubscribed
     */
    public release() {
        this.queue.release();
        this.cache.release();

        this.$cancel.next();
        this.$cancel.complete();
        this.$onRelease.next();
        this.$onRelease.complete();
    }

    /**
     * Internal dequeue function to get next
     * item from the array
     */
    private dequeue() {
        // Check if the pointer already is at the end of the tracklist
        // If true, return null
        if(this.hasEnded) return null;

        return this.queue.dequeue();
    }

    /**
     * Fetch next page of items 
     * from remote api
     */
    private getNextItems(): Observable<Page<PlayableItem>> {
        // If the maximum has already been fetched, return empty page
        if(this.hasFetchedAll) return of(Page.empty());

        // Check if next offset already fetched
        const nextOffset = this.cache.lastCachedPageInfo?.nextOffset ?? 0;
        if(this.cache.has(this.getPageByOffset(nextOffset))) return of(null);

        return this.fetchPage(nextOffset).pipe(
            takeUntil(this.$cancel),
            map((page) => {
                if(isNull(page)) return Page.empty();

                // Cache first page from metadata object
                this.cache.set(page.info.index, page);
                // Enqueue first page from metadata object
                this.queue.enqueue(page.items);
                return page;
            })
        )
    }

    /**
     * Fetch a page from api
     * @param pageIndex Page to fetch
     * @returns {Page<T>}
     */
    private fetchPage(offset: number, limit?: number): Observable<Page<PlayableItem> | null> {
        // Build page settings
        const pageable = new Pageable(offset, limit ?? PAGE_SIZE);

        let params;
        if(!isNull(this.metadata.seed)) {
            params = new URLSearchParams();
            params.set("seed", `${this.seed}`);
        }

        // Fetch next page of tracks
        return this.httpClient.get<Page<PlayableItem>>(`${this.apiBaseUrl}/v1/songs/${this.type}/${this.id}${pageable.toQuery()}${isNull(params) ? '': `&${params.toString()}`}`).pipe(
            // Transform to future to get loading state
            toFuture(),
            // Only continue if future is resolved
            filter((request) => !request.loading),
            // Handle errors
            tap((request) => {
                // Push error to tracklist if exists
                if(!isNull(request.error)) this.publishError(request.error);
            }),
            // Return page content
            map((request) => request.data),
        );
    }

    private getPageByOffset(offset: number) {
        return Math.floor(Math.max(0, offset) / PAGE_SIZE);
    }

    /**
     * 
     * @param error 
     */
    private publishError(error: ApiError) {
        if(isNull(error)) return;
        this.error.next(error);
    }

    /**
     * Fetch tracklist metadata
     * @param ownerId Id of the tracklist owner. This can for example be an album's id. Usually its the id of the resource to which the tracklist belongs
     * @param ownerType Type of the tracklist owner
     * @param startWithId Id of an item in the tracklist to put at beginning of the tracklist
     * @param shuffled Generate a shuffled tracklist
     * @returns {Future<TracklistV2>}
     */
    private fetchMetadata(owner: PlayableEntity, startWithId?: string, shuffled?: boolean): Observable<Future<TracklistV2<PlayableItem>>>; 
    /**
     * Fetch tracklist metadata
     * @param ownerId Id of the tracklist owner. This can for example be an album's id. Usually its the id of the resource to which the tracklist belongs
     * @param ownerType Type of the tracklist owner
     * @param startAtIndex Index in tracklist to start playback at
     * @param shuffled Generate a shuffled tracklist
     * @returns {Future<TracklistV2>}
     */
    private fetchMetadata(owner: PlayableEntity, startAtIndex?: number, shuffled?: boolean): Observable<Future<TracklistV2<PlayableItem>>>; 
    private fetchMetadata(owner: PlayableEntity, startAtIndex?: number, startWithId?: string, shuffled?: boolean): Observable<Future<TracklistV2<PlayableItem>>>; 
    private fetchMetadata(owner: PlayableEntity, startAtIndexOrWithId?: number | string, shuffledOrStartWithId?: boolean | string, shuffled?: boolean): Observable<Future<TracklistV2<PlayableItem>>> {
        const startAtIndex: number = typeof startAtIndexOrWithId === "number" ? startAtIndexOrWithId : 0;
        const startWithId: string = typeof startAtIndexOrWithId === "string" ? startAtIndexOrWithId : typeof shuffledOrStartWithId === "string" ? shuffledOrStartWithId : undefined;
        const shuffledTracklist: boolean = typeof shuffledOrStartWithId === "boolean" ? shuffledOrStartWithId : (shuffled ?? false)

        // Build page settings
        const pageable = new Pageable(startAtIndex, (shuffledTracklist && !isNull(startAtIndex)) ? PAGE_SIZE + 1 : PAGE_SIZE);
        // Encode owner id
        const validatedOwnerId = encodeURIComponent(owner.id);
        // Encode owner type
        const validatedOwnerType = encodeURIComponent(owner.type.toLowerCase());

        // Create url search params instance including
        // previously initialized page settings
        const params = new URLSearchParams(pageable.toParams());
        // Add shuffled parameter
        params.set("shuffled", `${shuffledTracklist}`);

        // Check if is shuffled and a startWithId is set
        if(shuffledTracklist && !isNull(startWithId)) {
            // If true, set includeOffset parameter to 
            // include item at startAtIndex when shuffled
            params.set("startWithId", `${startWithId}`);
        }

        // Perform fetch request
        return this.httpClient.get<TracklistV2<PlayableItem>>(`
            ${this.apiBaseUrl}/v2/tracklists/${validatedOwnerType}/${validatedOwnerId}?${params.toString()}`).pipe(
            toFuture(), 
            takeUntil(this.$cancel)
        );
    }

}