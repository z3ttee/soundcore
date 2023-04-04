import { HttpClient } from "@angular/common/http";
import { ApiError, Future, PlayableEntity, toFuture, TracklistV2 } from "@soundcore/sdk";
import { isNull, Page, Pageable } from "@soundcore/common";
import { BehaviorSubject, concat, defer, EMPTY, filter, map, mergeMap, Observable, of, Subject, take, takeUntil, tap } from "rxjs";
import { QueuePointer } from "./queue-pointer";

/**
 * Tracklist class to handle tracklists by providing an integrated queueing system
 * @template T Type of the items inside the tracklist
 */
export class SCNGXTracklist<T = any> {

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

    /**
     * List of items that have been fetched
     */
    private items: T[];

    /**
     * Int value to track at which point in the 
     * tracklist the playback currently is
     */
    // private currentQueuePointer: number = 0;
    private readonly queuePointer: QueuePointer = new QueuePointer();

    /**
     * Internal state management for fetched pages, to check
     * if a page was already fetched
     */
    private readonly fetchedPages: Set<number> = new Set();

    /**
     * Currently selecte size of each page that
     * is fetched
     */
    private readonly pageSize: number;

    private readonly metadataSubject: BehaviorSubject<TracklistV2<T>> = new BehaviorSubject(null);
    public readonly $metadata = this.metadataSubject.asObservable().pipe(takeUntil(this.$cancel));

    /**
     * Observable that emits ready state. A tracklist is considered ready, when all
     * metadata has been fetched. When restarting or shuffling a playlist, metadata will be fetched
     * again causing this observable to switch values.
     */
    public readonly $ready: Observable<boolean> = this.$metadata.pipe(map((metadata) => !isNull(metadata)));

    private nextOffset = 0;
    // private didStartPlaying;

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
        private startAtIndex: number = 0,
        /**
         * Define if the tracklist should be shuffled upon creation
         */
        generateShuffled: boolean = false
    ) {
        this.restart(startAtIndex, generateShuffled).subscribe();
    }

    public static create<T = any>(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, generateShuffled?: boolean): Observable<Future<SCNGXTracklist<T>>>;
    public static create<T = any>(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAt?: number): Observable<Future<SCNGXTracklist<T>>>;
    public static create<T = any>(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAt?: number, generateShuffled?: boolean): Observable<Future<SCNGXTracklist<T>>>;
    /**
     * Create a new tracklist instance
     * @param apiBaseUrl Base url to the API service
     * @param httpClient HttpClient to send http requests with
     * @param ownerId Id of the related resource to which the tracklist belongs. This can for example be an album, artist etc.
     * @param ownerType Type of the related resource to which the tracklist belongs. This can for example be an album ("album"), artist ("artist") etc.
     * @param startAtIndex Index of track to start playback at
     * @param generateShuffled Seed to use when generating shuffled tracklists
     */
    public static create<T = any>(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAtOrShuffle?: number | boolean, generateShuffled?: boolean): Observable<Future<SCNGXTracklist<T>>> {
        return new Observable((subscriber) => {
            // Check if owner is null
            if(isNull(owner)) {
                // If true, return 404 Future
                subscriber.next(Future.notfound());
                subscriber.complete();
                return;
            }

            const startAt = typeof startAtOrShuffle === "number" ? startAtOrShuffle : 0;
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
    public get metadata(): TracklistV2<T> {
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
        return this.items.length >= this.size;
    }

    /**
     * Check if the tracklist already started playing.
     */
    // public get hasStarted() {
    //     return this.didStartPlaying;
    // }

    /**
     * Get the current queue size
     */
    // public get queueSize() {
    //     return this.queue.length;
    // }

    /**
     * Check if the tracklist reached end of playback.
     * This is true, if the tracklist is empty (has no items)
     * or the internal queue reached end of the list of items
     */
    public get hasEnded() {
        return this.isEmpty || this.queuePointer.reachedEnd;
    }

    private get fetchedItemsCount() {
        return this.items.length;
    }

    /**
     * Check if the next page should be fetched
     * This is true, when the current queue pointer is near the end of fetched items count
     */
    private get shouldFetchNext() {
        return !this.hasFetchedAll && (this.queuePointer.position+1) >= this.fetchedItemsCount
    }

    /**
     * Check if the next page can be prefetched.
     * This is determined on the position of the queue pointer.
     * A new page should be prefetched
     */
    private get shouldPrefetchNext() {
        return !this.hasFetchedAll && (this.queuePointer.position+7) >= this.fetchedItemsCount
    }

    /**
     * Restart the tracklist
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(generateShuffled?: boolean): Observable<SCNGXTracklist<T>>;
    /**
     * Restart the tracklist
     * @param startAtIndex Index in tracklist where the tracklist should start
     */
    public restart(startAtIndex?: number): Observable<SCNGXTracklist<T>>;
    /**
     * Restart the tracklist
     * @param startAtIndex Index in tracklist where the tracklist should start
     * @param generateShuffled Define if the restarted tracklist should be shuffled or not
     */
    public restart(startAtIndex?: number, generateShuffled?: boolean): Observable<SCNGXTracklist<T>>;
    public restart(startAtIndexOrgenerateShuffled?: number | boolean, generateShuffled?: boolean): Observable<SCNGXTracklist<T>> {
        // Extract info if tracklist should be shuffled
        const shouldGenerateShuffled: boolean = typeof startAtIndexOrgenerateShuffled === "boolean" ? (startAtIndexOrgenerateShuffled || generateShuffled) : (generateShuffled ?? false);
        const startAt: number = typeof startAtIndexOrgenerateShuffled === "number" ? startAtIndexOrgenerateShuffled as number : this.queuePointer.position;

        console.log(startAt);

        // Update current startAt
        this.startAtIndex = startAt;

        // Cancel all ongoing requests
        this.$cancel.next();
        // Clear current metadata. This will also
        // cause the ready state to switch to false
        this.metadataSubject.next(null);

        // Clear items
        this.items = null;

        // Reset queue pointer to new index
        // this.queuePointer.setMin(startAt);
        this.queuePointer.setMin(0)
        this.queuePointer.reset();

        // Fetch metadata
        return this.fetchMetadata(this.owner, startAt, shouldGenerateShuffled).pipe(
            takeUntil(this.$cancel),
            filter((request) => !request.loading),
            map((request) => {
                // Publish error if exists
                if(request.error) {
                    this.publishError(request.error);
                    return null;
                }

                // Set new maximum for pointer
                this.queuePointer.setMax(request.data?.size);
                // Reload queue position
                this.queuePointer.reset();
                // Register first page
                this.setNextOffset(request.data?.items?.nextOffset);
                this.cachePage(request.data?.items);
                // Save metadata by pushing to subject
                this.metadataSubject.next(request.data);
                return this;
            }),
            tap(() => {
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

    private convertToInternalIndex(indexInTracklist: number): number {
        const index = indexInTracklist - this.startAtIndex;
        if(index < 0 || index >= this.size) return null;
        return index;
    }

    /**
     * Check if an item with specified id is currently playing
     * @param itemId Id of the target item
     */
    public isPlayingById(itemId: string) {
        if(isNull(itemId)) return false;
        const item = this.items[this.queuePointer.prev ?? 0];
        return item?.["id"] === itemId;
    }

    /**
     * Check if an item at index is currently playing
     * @param index Index in tracklist to lookup
     */
    public isPlayingIndex(index: number) {
        return this.convertToInternalIndex(index) == this.queuePointer.prev;
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem(): Observable<T> {
        return new Observable<T>((subscriber) => {
            // If index is null, no specific index is request
            // That means, we can return the next item in queue
            if(this.shouldPrefetchNext && !this.shouldFetchNext) {
                // Execute in background
                this.getNextItems().pipe(takeUntil(this.$cancel)).subscribe();
            }

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
    }

    /**
     * Release used resources. This will cause
     * all listeners to be unsubscribed
     */
    public release() {
        this.$cancel.next();
        this.$cancel.complete();
        this.$onRelease.next();
        this.$onRelease.complete();
    }

    /**
     * Internal dequeue function to get next
     * item from the array
     */
    private dequeue(): T {
        // Check if the pointer already is at the end of the tracklist
        // If true, return null
        if(this.hasEnded) return null;

        // Get next element
        const item = this.items[this.queuePointer.position] ?? null;
        // Increment pointer
        this.queuePointer.inc();
        return item;
    }

    /**
     * Fetch next page of items 
     * from remote api
     */
    private getNextItems(): Observable<Page<T>> {
        // If the maximum has already been fetched, return empty page
        if(this.hasFetchedAll || isNull(this.nextOffset)) return of(Page.empty());

        if(this.hasPage(this.getPageByOffset(this.nextOffset))) {
            // Return empty page to continue with dequeing
            return of(null);
        }

        // Fetch next page of tracks
        return this.fetchPage(this.nextOffset).pipe(
            // Add page to queue
            map((page) => {
                if(!isNull(page)) {
                    this.setNextOffset(this.nextOffset);
                    this.cachePage(page);
                }

                return page ?? Page.empty();
            }),
        );
    }

    /**
     * Fetch a page from api
     * @param pageIndex Page to fetch
     * @returns {Page<T>}
     */
    private fetchPage(offset: number): Observable<Page<T>> {
        // Build page settings
        const pageable = new Pageable(offset, this.pageSize);

        let params;
        if(!isNull(this.metadata.seed)) {
            params = new URLSearchParams();
            params.set("seed", `${this.seed}`);
        }

        // Fetch next page of tracks
        return this.httpClient.get<Page<T>>(`${this.apiBaseUrl}/v1/songs/${this.type}/${this.id}${pageable.toQuery()}${isNull(params) ? '': `&${params.toString()}`}`).pipe(
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
        if(this.pageSize <= 0) return 0;
        return Math.floor(Math.max(0, offset) / this.pageSize);
    }

    /**
     * Check if a page was already fetched.
     * @param pageIndex Index to check
     * @returns True, if the page was already fetched. Otherwise false
     */
    private hasPage(pageIndex: number) {
        return this.fetchedPages.has(pageIndex);
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
     * Internally cache the result of a page. This will
     * register the pageIndex as "fetched" and perform
     * required function calls to register the fetched contents
     * @param page Page that was fetched
     */
    private cachePage(page: Page<T>) {
        if(isNull(page)) return;

        const limit = page.info.limit;
        const offset = page.info.limit;
        const items = page.items;

        this.fetchedPages.add(page.info.index);
        if(isNull(this.items)) {
            this.items = Array.from({length: items.length}).map((_, i) => items[i]);
            return;
        }

        this.items.splice(offset, limit, ...Array.from({length: items.length}).map((_, i) => items[i]));
    }

    private setNextOffset(offset: number) {
        this.nextOffset = offset;
    }

    /**
     * Fetch tracklist metadata
     * @param ownerId Id of the tracklist owner. This can for example be an album's id. Usually its the id of the resource to which the tracklist belongs
     * @param ownerType Type of the tracklist owner
     * @param startAtIndex Index in tracklist to start playback at
     * @param shuffled Generate a shuffled tracklist
     * @returns {Future<TracklistV2>}
     */
    private fetchMetadata(owner: PlayableEntity, startAtIndex: number = 0, shuffled: boolean = false) {
        const pageable = new Pageable(startAtIndex, 15);
        // Perform fetch request
        return this.httpClient.get<TracklistV2<T>>(`${this.apiBaseUrl}/v2/tracklists/${encodeURIComponent(owner.type.toLowerCase())}/${encodeURIComponent(owner.id)}${pageable.toQuery()}&shuffled=${encodeURIComponent(shuffled)}`).pipe(
            toFuture(), 
            takeUntil(this.$cancel)
        );
    }

}