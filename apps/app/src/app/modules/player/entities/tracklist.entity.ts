import { HttpClient } from "@angular/common/http";
import { ApiError, toFuture, TracklistV2 } from "@soundcore/sdk";
import { isNull, Page, Pageable } from "@soundcore/common";
import { catchError, concat, defer, EMPTY, filter, from, map, mergeMap, Observable, of, Subject, take, takeUntil, tap } from "rxjs";

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
     * Internal queue array
     */
    private readonly queue: T[];

    /**
     * Internal state management for fetched pages, to check
     * if a page was already fetched
     */
    private readonly fetchedPages: Set<number>;

    private nextPageIndex;
    private fetchedItemsCount;
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
        this.queue = [ ...this.metadata.items.items ];
        // Initialize set with first fetched page
        this.fetchedPages = new Set([0]);

        this.nextPageIndex = 1;
        this.didStartPlaying = false;
        this.fetchedItemsCount = this.metadata.items.items.length;

        // Remove items list from tracklist to save memory
        metadata.items.items.splice(0, metadata.items.items.length);
    }

    public get pageSize(): number {
        return this.metadata.items.info.limit;
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
        return this.metadata.size > 0;
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
        return this.fetchedItemsCount >= this.size;
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
    public get queueSize() {
        return this.queue.length;
    }

    /**
     * Check if the queue is empty. This also considers
     * items that were not yet needed and are therefor not yet
     * fetched.
     */
    public get isQueueEmpty() {
        return this.isEmpty || (this.hasFetchedAll && this.queueSize <= 0);
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem(index: number = 0): Observable<T> {
        return new Observable<T>((subscriber) => {
            // Check if page for index was fetched, if true, continue 
            // with existing data
            if(this.hasFetchedIndex(index)) {
                // TODO: Cannot use index to dequeue, because queue is not always same size as tracklist

                // If queue is not empty, take next item
                // from queue
                if(this.isNotEmpty) {
                    subscriber.next(this.dequeue(index));
                    subscriber.complete();
                    return
                }

                // Queue is empty, try fetching next page of items
                subscriber.add(this.getNextItems().subscribe((page) => {
                    // If queue is still empty after fetching new page of items,
                    // the queue is completely empty and the tracklist is done playing.
                    if(this.isEmpty) {
                        subscriber.next(null);
                        subscriber.complete();
                        return
                    }

                    subscriber.next(this.dequeue(index));
                    subscriber.complete();
                }));
            } else {
                const startPageIndex = this.nextPageIndex;
                const targetPageIndex = this.getPageOfIndex(index);
                // Index was not yet fetched

                subscriber.add(this.fetchUntilPage(startPageIndex, targetPageIndex).subscribe((pages) => {
                    console.log(pages);
                }))
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
    private dequeue(index: number): T {
        return this.queue.splice(index, 1)?.[0] ?? null;
    }

    /**
     * Dequeue a track at a specific position.
     * If needed, all tracks that were enqueued before the target can
     * be removed from the queue as well. Only the target will be returned.
     * This function will fetch all required pages iteratively.
     * @param index Position in the queue to deqeueue
     * @param dequeuePrevious Define if all items before that target are should get removed from the queue
     */
    // private dequeueAt(index: number, dequeuePrevious: boolean = false): Observable<T> {
    //     return new Observable((subscriber) => {
    //         // Check if page for index was already fetched
    //         if(!this.hasFetchedIndex(index)) {
    //             // If not, fetch all pages till index is reached
    //             const targetPageIndex = this.getPageOfIndex(index);
    //             const pageIndexDiff = targetPageIndex - this.nextPageIndex;

    //             const requests = [];
    //             for(let pageIndex = 0; pageIndex < pageIndexDiff; pageIndex++) {
    //                 requests.push(
    //                     this.fetchPage()
    //                 )
    //             }
    //         }


    //     });
    // }

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
            tap((page) => {
                this.nextPageIndex++;
                this.fetchedItemsCount += page.items.length;
                this.queue.push(...page.items);
            })
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
     * Check if the page to which an index would resolve was
     * already fetched.
     * @param index Index to check
     * @returns True, if the page was already fetched. Otherwise false
     */
    private hasFetchedIndex(index: number) {
        console.log("fetched pages: ", this.fetchedPages);
        return this.fetchedPages.has(this.getPageOfIndex(index));
    }

    /**
     * 
     * @param error 
     */
    private publishError(error: ApiError) {
        if(isNull(error)) return;
        this.error.next(error);
    }

}