import { HttpClient } from "@angular/common/http";
import { ApiError, toFuture, TracklistV2 } from "@soundcore/sdk";
import { isNull, Page, Pageable } from "@soundcore/common";
import { concat, defer, EMPTY, filter, map, mergeMap, Observable, of, Subject, take, takeUntil, tap } from "rxjs";

/**
 * Tracklist class to handle tracklists by providing an integrated queueing system
 * @template T Type of the items inside the tracklist
 */
export class SCNGXTracklist<T = any> {

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
    private readonly items: T[];

    /**
     * Int value to track at which point in the 
     * tracklist the playback currently is
     */
    private currentQueuePointer: number = 0;

    /**
     * Internal queue array
     */
    // private readonly queue: T[];

    /**
     * Internal state management for fetched pages, to check
     * if a page was already fetched
     */
    private readonly fetchedPages: Set<number> = new Set();

    private readonly pageSettings: Pageable;

    private nextPageIndex;
    private didStartPlaying;

    constructor(
        /**
         * Tracklist metadata to initialize tracklist datasource
         * @template {T} Type of items inside the tracklist
         */
        public readonly metadata: TracklistV2<T>,
        /**
         * Base URL used to build url for fetching
         * new items
         */
        private readonly apiBaseUrl: string,
        /**
         * HttpClient instance to perform
         * http requests.
         */
        private readonly httpClient: HttpClient
    ) {
        // Initialize queue with first page inside tracklist
        // this.queue = [ ...this.metadata.items.items ];
        // this.items.push(...this.metadata.items.items);
        // Initialize set with first fetched page
        // this.fetchedPages = new Set([0]);

        this.nextPageIndex = 1;
        this.didStartPlaying = false;
        // this.fetchedItemsCount = this.metadata.items.items.length;

        // Create array that can fit <size> elements in it
        this.items = Array.from({ length: this.metadata.size });
        // Register first page of metadata
        this.cachePage(this.metadata.items);
        // Copy page settings from first received page
        this.pageSettings = new Pageable(this.metadata.items.info.index, this.metadata.items.info.limit);

        // Remove items list from tracklist to save memory
        delete metadata.items;
    }

    public get pageSize(): number {
        return this.pageSettings.limit;
    }

    /**
     * Get the id of the tracklist.
     * This usually equals to the id of the resource to which
     * the tracklist belongs.
     * E.g.: If the tracklist belongs to an album, the id
     * equals to the album's id
     */
    public get id(): string {
        return this.metadata.id;
    }

    /**
     * Get the size of the tracklist
     */
    public get size(): number {
        return this.metadata.size;
    }

    /**
     * Check if the tracklist is empty
     */
    public get isEmpty(): boolean {
        return this.metadata.size <= 0;
    }

    /**
     * Check if the tracklist is not empty
     */
    public get isNotEmpty(): boolean {
        return !this.isEmpty;
    }

    /**
     * Get type of the tracklist
     */
    public get type() {
        return this.metadata.type;
    }

    /**
     * Get seed that is used 
     * to build the tracklist
     */
    public get seed() {
        return this.metadata.seed;
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
    public get hasStarted() {
        return this.didStartPlaying;
    }

    /**
     * Get the current queue size
     */
    // public get queueSize() {
    //     return this.queue.length;
    // }

    /**
     * Check if the queue is empty. This also considers
     * items that were not yet needed and are therefor not yet
     * fetched.
     */
    public get hasEnded() {
        return this.isEmpty || this.currentQueuePointer >= this.size;
    }

    private get fetchedItemsCount() {
        return this.items.length;
    }

    /**
     * Check if the next page should be fetched
     * This is true, when the current queue pointer is near the end of fetched items count
     */
    private get shouldFetchNext() {
        return !this.hasFetchedAll && (this.currentQueuePointer+1) >= this.fetchedItemsCount
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem(indexInTracklist?: number): Observable<T> {
        return new Observable<T>((subscriber) => {
            // If index is null, no specific index is request
            // That means, we can return the next item in queue
            if(isNull(indexInTracklist)) {
                // If next page should be fetched
                if(this.shouldFetchNext) {
                    // If true, fetch page
                    console.log("fetch next page");
                    subscriber.add(this.getNextItems().subscribe(() => {
                        // After fetching next items, dequeue next item
                        subscriber.next(this.dequeue());
                        subscriber.complete();
                    }));
                } else {
                    // If false, return next item
                    subscriber.next(this.dequeue());
                    subscriber.complete();
                }
            } else {
                // If index is set, a specific item was requested by the player
                // This usually happens, when the user explicitly started a song inside
                // that tracklist

                // First, check if the page has already been fetched in which the requested
                // index (item) is located
                const targetPageIndex = this.getPageOfIndex(indexInTracklist);

                console.log("target page: ", targetPageIndex)

                if(!this.hasPage(targetPageIndex)) {
                    // If the page was not fetched yet, fetch all pages
                    // until the target page was fetched
                    // TODO
                } else {
                    // If true, return item at index
                    subscriber.next(this.items[indexInTracklist] ?? null);
                    subscriber.complete();
                }
            }
        }).pipe(
            // Because an item was dequeued, it means the 
            // tracklist started playing
            tap(() => this.didStartPlaying = true),
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
        this.$onRelease.next();
        this.$onRelease.complete();
    }

    /**
     * Internal dequeue function to get next
     * item from the array
     */
    private dequeue(index?: number): T {
        // Check if the pointer already is at the end of the tracklist
        // If true, return null
        if(this.hasEnded) return null;

        let item: T;
        if(isNull(index)) {
            // Get next element
            item = this.items[this.currentQueuePointer] ?? null;
            // Increment counter
            this.currentQueuePointer++;
        } else {
            // If index was set, return the 
            // requested item at that exact index
            item = this.items[index] ?? null;
            // Note: We do not want to increment the queue pointer at this point,
            // as a specific index was requested which usually means, the user started
            // playing a song manually in the tracklist
        }
        
        return item;
    }

    /**
     * Fetch next page of items 
     * from remote api
     */
    private getNextItems(): Observable<Page<T>> {
        // If the maximum has already been fetched, return empty page
        if(this.hasFetchedAll) return of(Page.empty());

        // Fetch next page of tracks
        return this.fetchPage(this.nextPageIndex).pipe(
            // Add page to queue
            tap((page) => this.cachePage(page))
        );
    }

    /**
     * Fetch a page from api
     * @param pageIndex Page to fetch
     * @returns {Page<T>}
     */
    private fetchPage(pageIndex: number): Observable<Page<T>> {
        // Build page settings
        const pageable = new Pageable(pageIndex, this.pageSize);

        const params = new URLSearchParams();
        params.set("seed", this.metadata.seed);

        if(!isNull(this.metadata.seed)) {
            // params.set("seed", this.metadata.seed);
        }

        console.log(params);

        // Fetch next page of tracks
        return this.httpClient.get<Page<T>>(`${this.getTracklistUrl()}/tracks${pageable.toQuery()}`).pipe(
            // Transform to future to get loading state
            toFuture(),
            // Only continue if future is resolved
            filter((request) => !request.loading),
            // Handle errors
            tap((request) => {
                this.publishError(request.error);
            }),
            // Return page content
            map((request) => request.data ?? Page.empty()),
        );
    }

    private fetchUntilPage(startPageIndex: number, maxPageIndex: number): Observable<Page<T>[]> {
        return new Observable((subscriber) => {
            const pageDiff = maxPageIndex - startPageIndex;

            const aggregatedPages: Page<T>[] = [];

            subscriber.add(defer(() => this.fetchPage(startPageIndex)).pipe(
                mergeMap((page) => {
                    const nextIndex = page.next;

                    const $page = of(page);
                    const $next = isNull(nextIndex) ? EMPTY : this.fetchPage(nextIndex);

                    return concat($page, $next);
                }),
                take(pageDiff),
            ).subscribe((page) => {
                aggregatedPages.push(page);

                // Check if current page equals target index
                if(page.info.index == maxPageIndex) {
                    // If true, all requested pages were fetched
                    // and the request can be completed
                    subscriber.next(aggregatedPages);
                    subscriber.complete();
                }
            }));
        })
    }

    /**
     * Get the url used for all tracklist operations
     * @returns 
     */
    private getTracklistUrl(): string {
        return `${this.apiBaseUrl}/v1/tracklists/${this.metadata.uri}`;
    }

    private getPageOfIndex(index: number) {
        return Math.floor(Math.max(0, index) / Math.max(1, this.pageSize));
    }

    /**
     * Check if a page was already fetched.
     * @param pageIndex Index to check
     * @returns True, if the page was already fetched. Otherwise false
     */
    private hasPage(pageIndex: number) {
        return this.fetchedPages.has(this.getPageOfIndex(pageIndex));
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
        const pageIndex = page.info.index;
        const pageLimit = page.info.limit;
        const items = page.items;

        this.fetchedPages.add(pageIndex);
        this.items.splice(pageIndex * pageLimit, pageLimit, ...Array.from({length: items.length}).map((_, i) => items[i]));
    }

}