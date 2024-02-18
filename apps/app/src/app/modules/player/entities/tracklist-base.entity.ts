import { HttpClient } from "@angular/common/http";
import { ApiError, Future, LikedSong, PlayableEntity, PlaylistItem, Song, toFuture, TracklistV2 } from "@soundcore/sdk";
import { isNull, isString, Page, Pageable } from "@soundcore/common";
import { BehaviorSubject, filter, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from "rxjs";
import { Queue } from "./queue";
import { Cache } from "./cache";

export const PAGE_SIZE = 30;
export type TracklistWithoutItems<T extends TracklistEntityTypes = Song> = Omit<TracklistV2<T>, "items">;
export type TracklistEntityTypes = Song | LikedSong | PlaylistItem;

export abstract class SCNGXBaseTracklist<T, U extends TracklistEntityTypes>  {
    /**
     * Subject to manage emition of 
     * cancel events
     */
    private readonly _cancelSubject: Subject<void> = new Subject();
    /**
     * Subject to manage emition of 
     * release process
     */
    private readonly $onRelease: Subject<void> = new Subject();
    /**
     * Subject to manage emition 
     * of errors
     */
    private readonly _errorSubject: Subject<ApiError> = new Subject();
    /**
     * Subject to manage emition 
     * of tracklist metadata
     */
    private readonly metadataSubject: BehaviorSubject<TracklistWithoutItems<U>> = new BehaviorSubject(null);

    /**
     * Internal queue to manage order of playback of tracks
     * in a tracklist.
     */
    protected readonly _queue: Queue<U> = new Queue();
    /**
     * Internal cache to manage fetched items
     */
    protected readonly _cache: Cache<U> = new Cache();

    /**
     * Subscribe to cancel events
     */
    protected readonly $onCancel = this._cancelSubject.asObservable();

    /**
     * Subscribe to errors that 
     * occur on the tracklist
     */
    public readonly $onError = this._errorSubject.asObservable().pipe(takeUntil(this.$onRelease));
    /**
     * Observable that emits currently 
     * enqueued items
     */
    public readonly $queue = this._queue.$items;
    /**
     * Observable that emits metadata
     * of the tracklist
     */
    public readonly $metadata = this.metadataSubject.asObservable().pipe(takeUntil(this.$onCancel));
    /**
     * Observable that emits ready state. A tracklist is considered ready, when all
     * metadata has been fetched. When restarting or shuffling a playlist, metadata will be fetched
     * again causing this observable to switch values.
     */
    public readonly $ready: Observable<boolean> = this.$metadata.pipe(map((metadata) => !isNull(metadata)));

    constructor(
        /**
         * Entity to which the tracklist belongs. This can for example
         * be an artist or album
         */
        public readonly owner: PlayableEntity,
        /**
         * Base URL used to build url for fetching
         * new items
         */
        protected readonly apiBaseUrl: string,
        /**
         * HttpClient instance to perform
         * http requests.
         */
        private readonly _httpClient: HttpClient,
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

    /**
     * Get current metadata snapshot
     */
    protected get metadata() {
        return this.metadataSubject.getValue();
    }

    /**
     * Id of the tracklist
     */
    public get id() {
        return this.metadata.id;
    }

    /**
     * Name of the tracklist
     */
    public get name() {
        return this.owner.name;
    }

    /**
     * Type of the tracklist
     */
    public get type() {
        return this.metadata.type
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

    public get queue() {
        return [...this._queue.items];
    }

    /**
     * Check if all items have been fetched
     * from the api (items are only fetched when needed)
     */
    public get hasFetchedAll() {
        return this._cache.length >= this.size;
    }

    /**
     * Check if the next page should be fetched
     * This is true, when the current queue pointer is near the end of fetched items count
     */
    private get shouldFetchNext() {
        return !this.hasFetchedAll && this._queue.size <= 8
    }

    /**
     * Check if the tracklist reached end of playback.
     * This is true, if the tracklist is empty (has no items)
     * or the internal queue reached end of the list of items
     */
    public get hasEnded() {
        return this.isEmpty || this._queue.size <= 0;
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
        return this._queue.lastDequeuedItem?.id === itemId;
    }

    /**
     * Get the httpclient instance that is
     * used to fetch items and metadata
     */
    protected getHttpClient() {
        return this._httpClient;
    }

    /**
     * Cancel all ongoing requests. For example
     * if a page is currently being fetched, but the
     * tracklist restarts, then the page-fetch-request
     * has to be canceled.
     * Under the hood, this will push to the $cancel subject
     * and cause a new emission
     */
    protected cancel() {
        this._cancelSubject.next();
    }

    /**
     * Push a new error to the tracklist
     * for consumption in UI
     * @param error Error instance that was received
     */
    protected error(error: ApiError) {
        if(isNull(error)) return;
        this._errorSubject.next(error);
    }

    /**
     * Calculate the page index for an offset value
     * @param offset Offset value
     * @returns Page Index
     */
    private getPageByOffset(offset: number) {
        return Math.floor(Math.max(0, offset) / PAGE_SIZE);
    }

    /**
     * Release used resources. This will cause
     * all listeners to be unsubscribed
     */
    public release() {
        this._queue.release();
        this._cache.release();

        this._cancelSubject.next();
        this._cancelSubject.complete();
        this.$onRelease.next();
        this.$onRelease.complete();
    }

    /**
     * Internal dequeue function to get next
     * item from the array
     */
    protected abstract dequeue(): Song;

    /**
     * Restart the tracklist
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(generateShuffled: boolean): Observable<T>;
    /**
     * Restart the tracklist
     * @param startAtIndex Index in tracklist where the tracklist should start
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(startAtIndex: number, generateShuffled?: boolean): Observable<T>;
    /**
     * Restart the tracklist
     * @param startWithId Id of the item in tracklist where the tracklist should start
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(startWithId: string, generateShuffled?: boolean): Observable<T>;
    public restart(startAtIndexOrgenerateShuffledOrStartWithId: number | boolean | string, generateShuffled?: boolean): Observable<T> {
        // Extract info if tracklist should be shuffled
        const shouldGenerateShuffled: boolean = typeof startAtIndexOrgenerateShuffledOrStartWithId === "boolean" ? (startAtIndexOrgenerateShuffledOrStartWithId || generateShuffled) : (generateShuffled ?? false);
        const startAt: number = typeof startAtIndexOrgenerateShuffledOrStartWithId === "number" ? startAtIndexOrgenerateShuffledOrStartWithId : 0;
        const startWithId: string = typeof startAtIndexOrgenerateShuffledOrStartWithId === "string" ? startAtIndexOrgenerateShuffledOrStartWithId : undefined;

        // Cancel all ongoing requests
        this.cancel();
        // Clear current metadata. This will also
        // cause the ready state to switch to false
        this.metadataSubject.next(null);
        // Clear cached items
        this._cache.clear();
        // Clear enqueued items
        this._queue.clearIfInitialized();

        // Fetch metadata
        return this.fetchMetadata(this.owner, startAt, startWithId, shouldGenerateShuffled).pipe(
            takeUntil(this.$onCancel),
            filter((request) => !request.loading),
            map((request) => {
                // Publish error if exists
                if(request.error) {
                    this.error(request.error);
                    return null;
                }

                const metadata = request.data;
                if(isNull(metadata)) return null;

                // Cache first page from metadata object
                this._cache.set(0, metadata.items);
                // Enqueue first page from metadata object
                this._queue.enqueue(metadata.items.items)
                // Remove page from metadata
                metadata.items = undefined;
                // Save metadata by pushing to subject
                this.metadataSubject.next(metadata);
                return this as unknown as T;
            }),
            tap((val) => {
                console.log("Tracklist restarted");
            })
        );
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem() {
        // if(this.wasReleased) return of(null);
        return this.$ready.pipe(
            filter((isReady) => isReady),
            take(1),
            takeUntil(this.$onCancel),
            switchMap(() => {
                return new Observable<Song>((subscriber) => {        
                    // If next page should be fetched
                    if(this.shouldFetchNext) {
                        // If true, fetch page
                        subscriber.add(this.getNextItems().pipe(takeUntil(this.$onCancel)).subscribe(() => {
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
            takeUntil(this.$onCancel)
        );
    }    

    /**
     * Fetch next page of items 
     * from remote api
     */
    private getNextItems(): Observable<Page<U>> {
        // If the maximum has already been fetched, return empty page
        if(this.hasFetchedAll || this.hasEnded) return of(Page.empty());

        // Check if next offset already fetched
        const nextOffset = this._cache.lastCachedPageInfo?.nextOffset ?? 0;
        if(this._cache.has(this.getPageByOffset(nextOffset))) return of(null);

        return this.fetchPage(nextOffset).pipe(
            takeUntil(this.$onCancel),
            map((page) => {
                if(isNull(page)) return Page.empty();

                // Cache first page from metadata object
                this._cache.set(page.info.index, page);
                // Enqueue first page from metadata object
                this._queue.enqueue(page.items);
                return page;
            })
        )
    }

    /**
     * Fetch a page from api
     * @param pageIndex Page to fetch
     * @returns {Page<T>}
     */
    private fetchPage(offset: number, limit?: number): Observable<Page<U> | null> {
        // Build page settings
        const pageable = new Pageable(offset, limit ?? PAGE_SIZE);

        let params;
        if(!isNull(this.metadata.seed)) {
            params = new URLSearchParams();
            params.set("seed", `${this.seed}`);
        }

        // Fetch next page of tracks
        return this._httpClient.get<Page<U>>(`${this.apiBaseUrl}/v1/songs/${this.type}/${this.id}${pageable.toQuery()}${isNull(params) ? '': `&${params.toString()}`}`).pipe(
            // Transform to future to get loading state
            toFuture(),
            // Only continue if future is resolved
            filter((request) => !request.loading),
            // Handle errors
            tap((request) => {
                // Push error to tracklist if exists
                if(!isNull(request.error)) this.error(request.error);
            }),
            // Return page content
            map((request) => request.data),
        );
    }

    /**
     * Fetch tracklist metadata
     * @param ownerId Id of the tracklist owner. This can for example be an album's id. Usually its the id of the resource to which the tracklist belongs
     * @param ownerType Type of the tracklist owner
     * @param startWithId Id of an item in the tracklist to put at beginning of the tracklist
     * @param shuffled Generate a shuffled tracklist
     * @returns {Future<TracklistV2>}
     */
    private fetchMetadata(owner: PlayableEntity, startWithId?: string, shuffled?: boolean): Observable<Future<TracklistV2<U>>>; 
    /**
     * Fetch tracklist metadata
     * @param ownerId Id of the tracklist owner. This can for example be an album's id. Usually its the id of the resource to which the tracklist belongs
     * @param ownerType Type of the tracklist owner
     * @param startAtIndex Index in tracklist to start playback at
     * @param shuffled Generate a shuffled tracklist
     * @returns {Future<TracklistV2>}
     */
    private fetchMetadata(owner: PlayableEntity, startAtIndex?: number, shuffled?: boolean): Observable<Future<TracklistV2<U>>>; 
    private fetchMetadata(owner: PlayableEntity, startAtIndex?: number, startWithId?: string, shuffled?: boolean): Observable<Future<TracklistV2<U>>>; 
    private fetchMetadata(owner: PlayableEntity, startAtIndexOrWithId?: number | string, shuffledOrStartWithId?: boolean | string, shuffled?: boolean): Observable<Future<TracklistV2<U>>> {
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
        return this._httpClient.get<TracklistV2<U>>(`
            ${this.apiBaseUrl}/v2/tracklists/${validatedOwnerType}/${validatedOwnerId}?${params.toString()}`).pipe(
            toFuture(), 
            takeUntil(this.$onCancel)
        );
    }

}