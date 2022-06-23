import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, map, Observable, of, Subject, Subscription, takeUntil } from "rxjs";
import { Page, Pageable, Song } from "soundcore-sdk";
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { SCNGXTrackID } from "../../entities/playable-source.entity";
import { SCNGXLogger } from "../logger/logger";

export type TrackListType = "byArtist" | "byPlaylist" | "byAlbum";

export const SCNGX_DATASOURCE_PAGE_SIZE = 50;

export interface TrackListDataSourceOptions {
    /**
     * URL that points to the detailed tracks endpoint.
     * Endpoint should be the one which actually returns the
     * metadata of tracks.
     */
    url: string;

    /**
     * Maximum amount of retrievable elements.
     * Used for pagination.
     */
    totalElements: number;
}

export interface TrackDataSourceItem {
    index: number;
    data: Song;
}

export class SCNGXTrackListDataSourceV2 {
    private readonly logger: SCNGXLogger = new SCNGXLogger("DATASOURCE");

    private _destroy: Subject<void> = new Subject();

    private _cachedData = Array.from<TrackDataSourceItem>({ length: this.options.totalElements });
    private _cachedMap = new Map<String, TrackDataSourceItem>();

    private _fetchedPages = new Set<number>();
    private _pageFetchStatus: boolean[] = [];

    private readonly _dataStream = new BehaviorSubject<TrackDataSourceItem[]>(this._cachedData);
    private readonly _subscription = new Subscription();
    private _isLocked: boolean = false;
    private _isConnected: boolean = false;

    public $stream: Observable<TrackDataSourceItem[]> = this._dataStream.asObservable().pipe(takeUntil(this._destroy));
    public readonly totalElements = this.options.totalElements;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly options: TrackListDataSourceOptions,
        private readonly tracks: SCNGXTrackID[]
    ) {}

    public connect($onMore: Observable<IPageInfo>): Observable<TrackDataSourceItem[]> {
        if(this._isConnected) return this._dataStream;

        this._subscription.add(
            $onMore.subscribe(page => {
                const startPage = this.getPageForIndex(page.startIndex);
                const endPage = this.getPageForIndex(page.endIndex);
    
                for (let i = startPage; i <= endPage; i++) {
                    this._fetchPage(i);
                }
            }),
        );
  
        this._isConnected = true;
        return this._dataStream;
    }

    /**
     * Find song metadata by track value.
     * @param track 
     * @returns 
     */
    public findByTrack(track: SCNGXTrackID): Observable<Song> {
        // TODO: Known issue: If the page is already in process of fetching, null will be returned (see _fetchPage()).
        const item = this._cachedMap.get(track.id);
        if(item) return of(item.data);

        const pageNr = this.getPageForTrack(track);
        return this._fetchPage(pageNr).pipe(
            map((page) => page.elements.find((song) => song.id == track.id)),
            takeUntil(this._destroy)
        );
    }

    /**
     * Disconnect the datasource.
     * This unsubscribes all subscriptions and releases
     * resources.
     */
    public disconnect(): void {
        if(this._isLocked) {
            this.logger.warn("Disconnecting a datasource that was marked as locked is not recommended. A locked datasource means, the source is still in use elsewhere. Because its disconencted now, the source might not be available anymore.")
        }

        this._subscription.unsubscribe();

        this._destroy.next();
        this._destroy.complete();
    }

    /**
     * Lock the datasource.
     * This will prevent the source from
     * being disconnected when still in use.
     */
    public lock() {
        this._isLocked = true;
    }

    /**
     * Unlock the datasource.
     * This removes disconnect prevention
     * and allows the source to be disconnected.
     */
    public unlock() {
        this._isLocked = false;
    }

    /**
     * Check if the source is locked.
     * @returns True or False
     */
    public isLocked() {
        return this._isLocked;
    }

    /**
     * Fetch a page of content based on the requested page.
     * @param pageNr Page to fetch
     */
    private _fetchPage(pageNr: number): Observable<Page<Song>> {
        // Check if page was already fetched or has invalid page settings.
        if (pageNr < 0 || this._fetchedPages.has(pageNr) || this._pageFetchStatus[pageNr]) {
            return of(Page.of([]));
        }
  
        // Update fetch status to true
        // If the same page will be fetched a short time after again,
        // this would result in race conditions or redundant requests.
        // So its just to wait for a response of the very first request that
        // was made for that specific page.
        this._pageFetchStatus[pageNr] = true;

        // Build page settings
        const pageable: Pageable = new Pageable(pageNr, SCNGX_DATASOURCE_PAGE_SIZE);

        const subject: Subject<Page<Song>> = new Subject();
        // Execute request to the detailsUrl
        firstValueFrom(this.httpClient.get<Page<Song>>(`${this.options.url}${pageable.toQuery()}`)).then((page) => {
            // Add page to the fetchedPages list.
            // Only on success, because if it fails it can be refetched next time.
            this._fetchedPages.add(pageNr);
  
            // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
            this._cachedData.splice(pageNr * SCNGX_DATASOURCE_PAGE_SIZE, SCNGX_DATASOURCE_PAGE_SIZE, ...Array.from({ length: page.elements.length }).map<TrackDataSourceItem>((_, i) => {
                if(!page.elements[i]) return null;
                const song = Object.assign(new Song(), page.elements[i]);

                return {
                    index: this._getIndexForPageAndItemIndex(pageNr, i),
                    data: song
                };
            }));
  
            // Push updated data array
            this._dataStream.next(this._cachedData);
            subject.next(page);
        }).finally(() => {
            this._pageFetchStatus[pageNr] = false;
            subject.complete();
        });

        return subject.asObservable().pipe(takeUntil(this._destroy));
    }

    /**
     * Calculate the page number by a given index.
     * @param index Index in the list to calculate its page
     * @returns Page number
     */
    private getPageForIndex(index: number): number {
        return Math.floor(index / SCNGX_DATASOURCE_PAGE_SIZE);
    }

    /**
     * Get the calculated page number of a track value.
     * This is usefull if the page containing a specific track
     * is needed, but has not been fetched yet.
     * @param track Track data
     * @returns Page number
     */
    private getPageForTrack(track: SCNGXTrackID): number {
        const index = this.tracks.findIndex((t) => t.id == track.id);
        return this.getPageForIndex(index);
    }

    private _getIndexForPageAndItemIndex(pageNr: number, index: number): number {
        const amount = pageNr * SCNGX_DATASOURCE_PAGE_SIZE;
        return amount + index;
    }

}