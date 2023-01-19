import { CollectionViewer } from "@angular/cdk/collections";
import { Future, LikedSong, Page, Pageable, PlaylistItem, SCSDKTracklist, SCSDKTracklistService, Song, toFuture, toFutureCompat, TracklistType } from "@soundcore/sdk";
import { catchError, filter, map, Observable, of, switchMap, takeUntil } from "rxjs";
import { Queue } from "../../../utils/queue/queue.entity";
import { TRACKLIST_REGISTRY } from "../utils/tracklist-builder";
import { SCNGXBaseDatasource, SCNGXDatasourceFreeHandler } from "./datasource.entity";

export type SCNGXTracklistItem = Song | LikedSong | PlaylistItem;

export class SCNGXTracklist<T = any, C = any> extends SCNGXBaseDatasource<SCNGXTracklistItem> {

    private tracklist?: SCSDKTracklist;

    private readonly claims: Set<SCNGXDatasourceFreeHandler> = new Set();
    public readonly queue: Queue<number> = new Queue();

    constructor(
        private readonly service: SCSDKTracklistService,
        public readonly contextType: TracklistType,
        private readonly assocResId: string,
        private readonly _context?: C,
        initialSize?: number,
        pageSize?: number
    ) {
        super(pageSize ?? 30, initialSize ?? pageSize);

        if(TRACKLIST_REGISTRY.has(this.id)) {
            throw new Error(`It is preferred to reuse existing tracklists. Please use the tracklist builder for building tracklists.`);
        } else {
            TRACKLIST_REGISTRY.set(this.id, this);
        }

        this.$destroyed.subscribe(() => {
            TRACKLIST_REGISTRY.delete(this.id);
            console.log(`Tracklist destroyed.`);
        });
    }

    public get id(): string {
        return `${this.contextType}-${this.assocResId}`;
    }

    public static buildId(assocResId: string, tracklistType: TracklistType) {
        return `${tracklistType}-${assocResId}`;
    }

    public get context(): C {
        return this._context;
    }

    public override disconnect(_: CollectionViewer): void {
        this.destroyIfNotClaimed().subscribe();
    }

    protected fetchPage(pageIndex: number): Observable<SCNGXTracklistItem[]> {
        // Build Page settings object
        const pageable = new Pageable(pageIndex, this.pageSize);

        return this.initializeTracklist().pipe(
            switchMap(([tracklist]) => {
                if(typeof tracklist === "undefined" || tracklist == null) return of([]);

                return this.service.getHttpClient().get<Page<T>>(`${tracklist.baseUrl}${pageable.toQuery()}`).pipe(
                    toFuture(),
                    filter((request) => !request.loading),
                    map((request) => {
                        if(request.error) {
                            throw request.error;
                        }
        
                        // Get page data and return it
                        let page: Page<T> = Page.of([], tracklist.size, 0);
                        if(request.data) {
                            page = request.data;
                            this.setTotalSize(page.totalElements);
                        }

                        return page.elements;
                    })
                );
            }),
            takeUntil(this.$destroyed)
        );
    }

    private initializeTracklist(): Observable<[SCSDKTracklist, boolean]> {
        return new Observable((subscriber) => {
            // Check if tracklist was fetched before
            if(typeof this.tracklist !== "undefined" && this.tracklist != null) {
                // Push result to subscriber
                subscriber.next([this.tracklist, false]);
                // Complete source to prevent memory leaks
                subscriber.complete();
                // Return so the rest of the observable does not get executed
                return;
            }

            // If the associated resource's id is invalid, throw error in subscriber
            // and complete the subscription
            if(typeof this.assocResId === "undefined" || this.assocResId == null) {
                subscriber.error(new Error(`Please provide a valid assocResId. Received ${this.assocResId}`));
                subscriber.complete();
                return;
            }

            // Fetch tracklist from api
            // First, build the request variable
            let request: Observable<Future<SCSDKTracklist>>;
            switch(this.contextType) {
                case TracklistType.PLAYLIST:
                    request = this.service.findByPlaylist(this.assocResId).pipe(toFutureCompat());
                    break;
                case TracklistType.ALBUM:
                    request = this.service.findByAlbum(this.assocResId).pipe(toFutureCompat());
                    break;
                case TracklistType.ARTIST:
                    request = this.service.findByArtist(this.assocResId).pipe(toFutureCompat());
                    break;
                case TracklistType.ARTIST_TOP:
                    request = this.service.findByArtistTop(this.assocResId).pipe(toFutureCompat());
                    break;
                case TracklistType.LIKED_SONGS:
                    request = this.service.findByLikedSongs().pipe(toFutureCompat());
                    break;

                default:
                    // Unexpected type, throw error
                    subscriber.error(new Error(`Received attempt to initialize tracklist with an invalid type. Received '${this.contextType}', expected one of [${Object.values(TracklistType).join(", ")}].`));
                    subscriber.complete();
                    return;
            }

            // Check if request could be built successfully
            if(typeof request === "undefined" || request == null) {
                subscriber.error(new Error(`Failed building request for fetching tracklist.`));
                subscriber.complete();
                return;
            }

            // Execute request and subscribe to result
            request.pipe(takeUntil(this.$destroyed)).subscribe((future) => {
                // Do nothing if status is just loading
                if(future.loading) return;
                // Throw error if future has error attached
                if(future.error) {
                    subscriber.error(future.error);
                    subscriber.complete();
                    return;
                }

                // Update current internal tracklist state
                this.tracklist = future.data;

                // Initialize queue
                this.setQueue(this.tracklist);

                // Clean up subscription
                subscriber.next([this.tracklist, true]);
                subscriber.complete();
            });
        });
    }

    /**
     * Put a claim on the datasource to prevent unintentional free
     * of other parts of the application. The handler must
     * return a boolean, either allowing destroying the tracklist or
     * denying it.
     * @param onFree Handler that allows or denies destroying a tracklist
     */
    public claim(onFree: SCNGXDatasourceFreeHandler) {
        this.claims.add(onFree);
    }

    /**
     * Remove a claim on the tracklist.
     * @param onFree Handle used to register the claim
     * @returns True, if handler existed and was removed, otherwise false
     */
    public unclaim(onFree: SCNGXDatasourceFreeHandler) {
        return this.claims.delete(onFree);
    }

    /**
     * Ask to destroy a tracklist. This will remove the registered claim if provided
     * and asks all other claims to free the resources. If one denies, the tracklist will still
     * exist.
     * @returns True, if the tracklist was destroyed. Otherwise false
     */
    public destroyIfNotClaimed(onFree?: SCNGXDatasourceFreeHandler): Observable<boolean> {
        // Unregister claim
        if(typeof onFree === "function") {
            this.unclaim(onFree);
        }

        return new Observable((subscriber) => {
            let allowDestroy: boolean = true;

            if(this.claims.size > 0) {
                console.warn(`Tracklist is claimed by ${this.claims.size} handlers. Asking to free resources...`);
                allowDestroy = false;

                for(const handler of this.claims) {
                    const didHandlerAllow = handler();
                    allowDestroy = didHandlerAllow;
                }
            }

            // Destroy tracklist if all handlers agreed.
            if(allowDestroy) {
                // Remove tracklist from registry.
                TRACKLIST_REGISTRY.delete(this.assocResId);
                // Trigger destroy
                this.destroy();
            } else {
                console.warn(`Tracklist not destroyed.`);
            }

            // Cleanup subscriber
            subscriber.next(allowDestroy);
            subscriber.complete();
        });
    }

    public getItemByIndex(index: number): Observable<SCNGXTracklistItem> {
        return new Observable((subscriber) => {
            // Make index min. 0
            const startIndex = Math.max(index, 0);

            // Calculate page and indexes
            const startPage = Math.floor(startIndex / this.pageSize);
            const indexInPage = startIndex - startPage * this.pageSize;

            subscriber.add(this.getPageOrFetch(startPage).pipe(catchError((err: Error) => {
                subscriber.error(err);
                subscriber.complete();
                return of(null);
            })).pipe(filter((val) => !!val)).subscribe((elements) => {
                const item = elements[indexInPage];

                subscriber.next(item);
                subscriber.complete();
            }));
        });
    }

    /**
     * Dequeue item from specific index.
     * @param index Index to dequeue from
     * @returns Item
     */
    public dequeueAt(index: number): Observable<Song> {
        if(this.queue.isEmpty()) {
            return of(null);
        }

        const item = this.queue.dequeueAt(index);
        if(typeof item === "undefined" || item == null) {
            return of(null)
        };

        return this.getItemByIndex(item).pipe(map((datasourceitem) => {
            // Check if object is either LikedSong or PlaylistItem
            // If true, extract song payload and return it
            if((datasourceitem as LikedSong)?.song || (datasourceitem as PlaylistItem)?.song) {
                return (datasourceitem as PlaylistItem)?.song;
            }

            // Object is just song object, return it
            return datasourceitem as Song;
        }));
    }

    /**
     * Dequeue item from random position
     * @returns Item
     */
    public dequeueRandom(): Observable<Song> {
        const index = Math.round(Math.random() * this.queue.size);
        return this.dequeueAt(index);
    }

    /**
     * Dequeue item from random position
     * @returns Item
     */
    public dequeue(): Observable<Song> {
        return this.dequeueAt(0);
    }

    public resetQueue(): Observable<void> {
        return this.initializeTracklist().pipe(map(([tracklist, wasFreshlyInitialized]) => {
            // Was initialized with this request, so the queue was set.
            if(wasFreshlyInitialized) return;

            // Otherwise set queue if the tracklist was initialized before
            this.setQueue(tracklist);
        }));
    }

    /**
     * Set internal queue state
     */
    private setQueue(tracklist: SCSDKTracklist) {
        const queue = Array.from(Array(tracklist.size).keys());
        this.queue.set(queue);
    }

}