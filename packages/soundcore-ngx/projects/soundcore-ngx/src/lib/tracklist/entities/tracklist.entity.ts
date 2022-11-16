import { apiResponse, ApiResponse, Logger, Page, Pageable, PlaylistItem, SCSDKTracklist, SCSDKTracklistService, Song, TracklistType } from "@soundcore/sdk";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { Queue } from "./queue.entity";
import { SCNGXBaseDatasource } from "../../scroll/entities/datasource.entity";
import { DatasourceItem } from "../../scroll/entities/datasource-item.entity";

export class SCNGXTracklist<C = any> extends SCNGXBaseDatasource<PlaylistItem> {
    private readonly logger = new Logger(SCNGXTracklist.name);

    private readonly _initializedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private tracklist?: SCSDKTracklist;

    public readonly queue: Queue<number> = new Queue();
    public readonly $initialized: Observable<boolean> = this._initializedSubject.asObservable();

    constructor(
        /**
         * Type of the tracklist. This will identify the tracklist
         * for example as artist, album or playlist.
         */
        private readonly type: TracklistType,
        /**
         * The unique identifier for the resource that is associated with that
         * tracklist. For example an artist's id for a tracklist containing songs
         * of an artist.
         */
        public readonly assocResId: string,
        
        private readonly service: SCSDKTracklistService,
        public readonly context?: C
    ) {
        // Sets page size to 30
        super(30);
    }

    protected getPageData(pageable: Pageable): Observable<PlaylistItem[]> {
        return this.initialize().pipe(switchMap((tracklist) => {
            return this.service.getHttpClient().get<Page<PlaylistItem>>(`${tracklist.metadataLocation}${pageable.toQuery()}`).pipe(
                apiResponse(),
                switchMap((response) => {
                    const page = response?.payload;

                    // If there were errors, set status to error.
                    // Then it can be retried later.
                    if(response.error) {
                        this.pushError(new Error(response.message));
                        return of([]);
                    }

                    return of(page.elements);
                })
            );
        }));
    }

    public getItemByIndex(index: number): Observable<DatasourceItem<PlaylistItem>> {
        return new Observable((subscriber) => {
            // Make index min. 0
            const startIndex = Math.max(index, 0);

            // Calculate page and indexes
            const startPage = Math.floor(startIndex / this.pageSize);
            const indexInPage = startIndex - startPage * this.pageSize;

            // Check if the page is already cached
            if(this.isCached(startPage)) {
                const page = this.getCachedPage(startPage);

                subscriber.next(page?.[indexInPage]);
                subscriber.complete();
            } else {
                // Directly calling the vscroll api. As we inherit from SCNGXDatasource, we do not
                // bypass internal caching etc.
                const request = this.get(index, 1, null) as Promise<DatasourceItem<PlaylistItem>[]>;

                // Hook to request results
                request.then((result) => {
                    // Here we can use index 0, because we only fetch the page with a total
                    // size of 1. So the only item is the requested song
                    subscriber.next(result?.[0]);
                }).catch((error: Error) => {
                    subscriber.error(error);
                    this.pushError(error);
                }).finally(() => {
                    // Complete in all cases
                    subscriber.complete();
                })
            }
        });
    }

    /**
     * Make a request to fetch the complete list of track ids for
     * a playable list. Additionally this will deliver the maximum
     * size of items as side effect which is used to virtualize the list.
     * @returns Page<PlaylistItem>
     */
    private findTrackList(): Observable<SCSDKTracklist> {
        return new Observable((subscriber) => {
            // Check if tracklist was fetched before
            if(typeof this.tracklist !== "undefined" && this.tracklist != null) {
                // Push result to subscriber
                subscriber.next(this.tracklist);

                // Complete source to prevent memory leaks
                subscriber.complete();
            } else {
                // Otherwise fetch tracklist
                let request: Observable<ApiResponse<SCSDKTracklist>>;

                if(this.assocResId) {
                    switch(this.type) {
                        case TracklistType.PLAYLIST:
                            request = this.service.findByPlaylist(this.assocResId)
                            break;
                        case TracklistType.ALBUM:
                            request = this.service.findByAlbum(this.assocResId)
                            break;
                        case TracklistType.ARTIST:
                            request = this.service.findByArtist(this.assocResId)
                            break;
                        case TracklistType.ARTIST_TOP:
                            request = this.service.findByArtistTop(this.assocResId)
                            break;
    
                        default:
                            // Unexpected type, "throw" error
                            subscriber.error(new Error(`Received attempt to initialize tracklist with an invalid type. Aborting...`));
                            subscriber.complete();
                            return;
                    }
                }

                // Check if request could be built
                if(typeof request !== "undefined" && request != null) {
                    // Execute request and save result internally
                    request.subscribe((response) => {
                        if(response.error) {
                            subscriber.error(new Error(response.message));
                        } else {
                            // Update tracklist state
                            const tracklist = response.payload;
                            this.setTracklist(tracklist);

                            // Push result to subscriber
                            subscriber.next(this.tracklist);
                        }

                        // Complete source to prevent memory leaks
                        subscriber.complete();
                    });
                } else {
                    subscriber.next(null);
                    subscriber.complete();
                }
            }
        });
    }

    /**
     * Destroy tracklist. This will free resources and
     * unsubscribes safely from observables
     */
    public destroy() {
        this._destroy.next();
        this._destroy.complete();

        this.logger.debug(`Destroyed tracklist.`);
    }

    /**
     * Dequeue item from specific index.
     * @param index Index to dequeue from
     * @returns Item
     */
    public dequeueAt(index: number): Observable<Song> {
        const item = this.queue.dequeueAt(index);
        if(typeof item === "undefined" || item == null) return of(null);

        return this.getItemByIndex(item).pipe(map((datasourceitem) => {
            return datasourceitem.data.song ?? datasourceitem.data as unknown as Song;
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

    /**
     * Initialize tracklist.
     * @returns SCSDKTracklist
     */
    public initialize(): Observable<SCSDKTracklist> {
        if(typeof this.tracklist !== "undefined" && this.tracklist != null) return of(this.tracklist);
        return this.findTrackList();
    }

    /**
     * Update internal tracklist state
     * @param tracklist Tracklist data to set
     */
    private setTracklist(tracklist: SCSDKTracklist) {
        this.tracklist = tracklist;
        this._initializedSubject.next(true);
        this.setQueue(tracklist);
    }

    /**
     * Set internal queue state
     */
    private setQueue(tracklist: SCSDKTracklist) {
        const queue = Array.from(Array(tracklist.size).keys());
        this.queue.set(queue);
    }

}