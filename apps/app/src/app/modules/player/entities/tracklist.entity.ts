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
        private readonly minimumQueueIndex: number = 0,
        /**
         * Define if the tracklist should be shuffled upon creation
         */
        generateShuffled: boolean = false
    ) {
        this.restart(minimumQueueIndex, generateShuffled).subscribe(() => {
            console.log("Tracklist restartet");
        });
    }

    /**
     * Create a new tracklist instance
     * @param apiBaseUrl Base url to the API service
     * @param httpClient HttpClient to send http requests with
     * @param ownerId Id of the related resource to which the tracklist belongs. This can for example be an album, artist etc.
     * @param ownerType Type of the related resource to which the tracklist belongs. This can for example be an album ("album"), artist ("artist") etc.
     * @param startAtIndex Index of track to start playback at
     * @param generateShuffled Seed to use when generating shuffled tracklists
     */
    public static create<T = any>(owner: PlayableEntity, apiBaseUrl: string, httpClient: HttpClient, startAtIndex: number = 0, generateShuffled: boolean = false): Observable<Future<SCNGXTracklist<T>>> {
        return new Observable((subscriber) => {
            // Check if owner is null
            if(isNull(owner)) {
                // If true, return 404 Future
                subscriber.next(Future.notfound());
                subscriber.complete();
                return;
            }

            // Send loading state first
            subscriber.next(Future.loading());
            // Create new tracklist instance
            const tracklist = new SCNGXTracklist(owner, apiBaseUrl, httpClient, startAtIndex, generateShuffled);
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

    public restart(generateShuffled?: boolean): Observable<TracklistV2<T>>;
    public restart(minimumQueueIndex?: number): Observable<TracklistV2<T>>;
    public restart(minimumQueueIndex?: number, generateShuffled?: boolean): Observable<TracklistV2<T>>;
    public restart(minimumQueueIndexOrgenerateShuffled?: number | boolean, generateShuffled?: boolean): Observable<TracklistV2<T>> {
        // Extract info if tracklist should be shuffled
        const shouldGenerateShuffled: boolean = typeof minimumQueueIndexOrgenerateShuffled === "boolean" ? (minimumQueueIndexOrgenerateShuffled || generateShuffled) : (generateShuffled ?? false);
        const startAt: number = typeof minimumQueueIndexOrgenerateShuffled === "number" ? minimumQueueIndexOrgenerateShuffled as number : 0;

        // Cancel all ongoing requests
        this.$cancel.next();
        // Clear current metadata. This will also
        // cause the ready state to switch to false
        this.metadataSubject.next(null);

        // Clear items
        this.items = null;

        // Reset queue pointer to new index
        this.queuePointer.setMin(startAt);
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
                this.cachePage(request.data?.items);
                // Save metadata by pushing to subject
                this.metadataSubject.next(request.data);
                return request.data;
            })
        );
    }

    public reshuffle(seed?: string) {
        // TODO: Shuffle all tracklists and the queue
        // TODO: API has to somehow give the original row numbers to match with the indexes in the datasource in the ui
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem(indexInTracklist?: number): Observable<T> {
        console.log("getting next");
        return new Observable<T>((subscriber) => {
            // If index is null, no specific index is request
            // That means, we can return the next item in queue
            if(isNull(indexInTracklist)) {
                // Check if should prefetch next page
                // This can only happen if it is not forced
                console.log(this.shouldPrefetchNext, this.shouldFetchNext)
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
                } else {
                    // If false, return next item
                    subscriber.next(this.dequeue());
                    subscriber.complete();
                }
            } else {
                subscriber.next(null);
                subscriber.complete();

                // If index is set, a specific item was requested by the player
                // This usually happens, when the user explicitly started a song inside
                // that tracklist. In such cases the tracklist queue must be rebuild to start
                // at that requested index. This is only done, if there is no specified seed.
                // If there is a seed, request the page where the index is in and get the track

                // if(isNull(this.seed)) {
                //     // If there is no seed, restart tracklist.
                //     // Restarting a tracklist means reaching the tracklist endpoint
                //     // and fetching the metadata again
                // }

                // subscriber.add(
                //     // First, check if the page has already been fetched in which the requested
                //     // index (item) is located
                //     of(this.getPageOfIndex(indexInTracklist))
                //     .pipe(
                //         switchMap((targetPageIndex) => {
                //             if(!this.hasPage(targetPageIndex)) {
                //                 // If the page was not fetched yet, fetch all pages
                //                 // until the target page was fetched
                //                 // TODO

                //                 return this.fetchUntilPage(this.nextPageIndex, targetPageIndex).pipe(
                //                     tap((pages) => console.log(pages)),
                //                     tap((pages) => {
                //                         pages.forEach((p) => {
                //                             this.setNextPageIndex(targetPageIndex+1);
                //                             this.cachePage(p);
                //                         })
                //                     }),
                //                     map((pages) => {
                //                         const tartetPage = pages[pages.length - 1];
                //                         const index = this.getIndexInPage(indexInTracklist);

                //                         console.log(targetPageIndex, tartetPage.info.index, index);

                //                         return tartetPage.items[index];
                //                     }),
                //                     takeUntil(this.$cancel),
                //                 );
                //             } else {
                //                 // If true, return item at index
                //                 return of(this.items[indexInTracklist] ?? null);
                //             }
                //         })
                //     ).subscribe((item) => {
                //         // Because specific index was request, reset
                //         // pointer to that index, but only if there is no seed set
                //         if(isNull(this.seed)) {
                //             // Set pointer to index + 1
                //             this.setPointerToIndex(indexInTracklist+1);
                //         }

                //         subscriber.next(item);
                //         subscriber.complete();
                //     })
                // );
            }
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
    private dequeue(index?: number): T {
        // Check if the pointer already is at the end of the tracklist
        // If true, return null
        if(this.hasEnded) return null;

        let item: T;
        if(isNull(index)) {
            // Get next element
            item = this.items[this.queuePointer.position] ?? null;
            // Increment pointer
            this.queuePointer.inc();
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
        console.log(`Fetching next page with offset ${this.nextOffset}`);

        if(this.hasPage(this.getPageByOffset(this.nextOffset))) {
            console.log("Page already fetched. Skipping")
            // Return empty page to continue with dequeing
            return of(Page.empty());
        }

        // Fetch next page of tracks
        return this.fetchPage(this.nextOffset).pipe(
            // Add page to queue
            map((page) => {
                console.log(page);

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
        // if(!isNull(this.metadata.seed)) {
        //     params = new URLSearchParams();
        //     params.set("seed", `${this.seed}`);
        // }

        // Fetch next page of tracks
        return this.httpClient.get<Page<T>>(`${this.getTracksBaseUrl()}${pageable.toQuery()}${isNull(params) ? '': `&${params.toString()}`}`).pipe(
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

    private fetchUntilPage(startPageIndex: number, maxPageIndex: number): Observable<Page<T>[]> {
        return new Observable((subscriber) => {
            const pageDiff = maxPageIndex - startPageIndex;

            const aggregatedPages: Page<T>[] = [];

            subscriber.add(defer(() => this.fetchPage(startPageIndex)).pipe(
                mergeMap((page) => {
                    const nextOffset = page.nextOffset;

                    const $page = of(page);
                    const $next = isNull(nextOffset) ? EMPTY : this.fetchPage(nextOffset);

                    return concat($page, $next);
                }),
                take(pageDiff),
            ).subscribe((page) => {
                aggregatedPages.push(page);

                // Check if current page equals target index
                // if(page.info.index == maxPageIndex) {
                //     // If true, all requested pages were fetched
                //     // and the request can be completed
                //     subscriber.next(aggregatedPages);
                //     subscriber.complete();
                // }
            }));
        })
    }

    /**
     * Get the url used for all tracklist operations
     * @returns 
     */
    private getTracksBaseUrl(): string {
        // const baseUrl = `${this.apiBaseUrl}/v1/songs/${this.type}/${this.id}`;
        return `${this.apiBaseUrl}/v1/songs/${this.type}/${this.id}`;
    }

    private getPageOfIndex(index: number) {
        return Math.floor(Math.max(0, index) / Math.max(1, this.pageSize));
    }

    private getPageByOffset(offset: number) {
        if(this.pageSize <= 0) return 0;
        return Math.floor(Math.max(0, offset) / this.pageSize);
    }

    private getIndexInPage(indexInTracklist) {
        const page = this.getPageOfIndex(indexInTracklist);
        const index = Math.ceil(indexInTracklist / (page*this.pageSize));
        return index;
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
        // Perform fetch request
        return this.httpClient.get<TracklistV2<T>>(`${this.apiBaseUrl}/v2/tracklists/${encodeURIComponent(owner.type.toLowerCase())}/${encodeURIComponent(owner.id)}?shuffled=${encodeURIComponent(shuffled)}&offset=${encodeURIComponent(startAtIndex)}`).pipe(
            toFuture(), 
            takeUntil(this.$cancel)
        );
    }

}