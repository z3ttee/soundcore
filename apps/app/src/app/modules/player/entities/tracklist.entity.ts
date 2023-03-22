import { HttpClient } from "@angular/common/http";
import { toFuture, TracklistV2 } from "@soundcore/sdk";
import { Page, Pageable } from "@soundcore/common";
import { filter, map, Observable, of, take, tap } from "rxjs";

export class SCNGXTracklist<T = any> {

    private readonly queue: T[] = [];
    private currentPageIndex = 0;
    private fetchedItemsCount = 0;

    constructor(
        public readonly metadata: TracklistV2<T>,
        private readonly apiBaseUrl: string,
        private readonly httpClient: HttpClient,
        private readonly pageSize: number = 30
    ) {
        // Add first page included in metadata object
        this.addPageToQueue(metadata.items);
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
     * Check if the queue is empty. This also considers
     * items that were not yet needed and are therefor not yet
     * fetched.
     */
    public get isQueueEmpty() {
        return this.isEmpty && this.fetchedItemsCount
    }

    /**
     * Get the next item from the queue. If the queue is empty,
     * this method will try to fetch a new page of tracks. If after that the 
     * queue is still empty (method returns null), the tracklist is done playing
     */
    public getNextItem(): Observable<T> {
        return new Observable<T>((subscriber) => {
            // If queue is not empty, take next item
            // from queue
            if(this.isNotEmpty) {
                subscriber.next(this.dequeue());
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

                subscriber.next(this.dequeue());
                subscriber.complete();
            }));
        }).pipe(
            // Only emit once, so the subscription 
            // is terminated after the first result
            take(1)
        );
    }

    /**
     * Internal dequeue function to get next
     * item from the array
     */
    private dequeue(): T {
        return this.queue.shift() ?? null;
    }

    /**
     * Fetch next page of items from remote api
     */
    private getNextItems(): Observable<Page<T>> {
        // If the maximum has already been fetched, return empty page
        if(this.size <= this.fetchedItemsCount) return of(Page.empty());

        // Build page settings
        const pageable = new Pageable(this.currentPageIndex, this.pageSize);

        // Fetch next page of tracks
        return this.httpClient.get<Page<T>>(`${this.getTracklistUrl()}/tracks${pageable.toQuery()}`).pipe(
            toFuture(),
            filter((request) => !request.loading),
            map((request) => request.data ?? Page.empty()),
            tap((page) => this.addPageToQueue(page))
        );
    }

    private addPageToQueue(page: Page<T>) {
        this.currentPageIndex++;
        this.fetchedItemsCount += page.items.length;
        this.queue.push(...page.items);
    }

    /**
     * Get the url used for all tracklist operations
     * @returns 
     */
    private getTracklistUrl(): string {
        return `${this.apiBaseUrl}/v1/tracklists/${this.metadata.uri}`;
    }

}