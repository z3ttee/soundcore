import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, map, Observable, takeUntil } from "rxjs";
import { Album, Artist, Playlist, Song, SCDKTracklist, PlaylistItem } from "soundcore-sdk";
import { SCNGX_DATASOURCE_PAGE_SIZE } from "../utils/datasource/datasource";
import { SCNGXPlaylistDatasource } from "../utils/datasource/playlist-datasource";
import { BaseTracklistDatasource } from "../utils/datasource/tracklist-datasource";
import { SCNGXPlayableSource, SCNGXTrack } from "./playable-source.entity";

export abstract class BasePlayableList<T> extends SCNGXPlayableSource<T> {
    /**
     * Ready subject that pushes new values to the $ready observable.
     * Both indicate, wether the playable list was initialized or not.
     * The list is initialized, after the request to the tracksUrl endpoint
     * was made and the result was processed. After that the $ready
     * observable will emit "true"
     */
    protected readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * Emits the initialization status of the playable list.
     * If false is emitted, the list is making a request to the tracksUrl endpoint
     * to retrieve page settings etc. It emits true as soon as this has happened.
     */
    public readonly $ready: Observable<boolean> = this._readySubject.asObservable().pipe(takeUntil(this._destroySubject));

    /**
     * Subject used to emit new values to $dataSource observable
     */
    protected readonly _dataSourceSubject: BehaviorSubject<BaseTracklistDatasource<T>> = new BehaviorSubject(null);

    /**
     * Observable that emits current dataSource object. The only reason to use an observable here is
     * because of the playable list design. On initialization, the list makes a request to the tracksUrl endpoint.
     * Only after this was performed, the dataSource becomes available.
     */
    public readonly $dataSource: Observable<BaseTracklistDatasource<T>> = this._dataSourceSubject.asObservable().pipe(takeUntil(this._destroySubject));
    public readonly $onReleased: Observable<void> = this._destroySubject.asObservable();

    public readonly context: Playlist | Album | Artist;
    protected tracks: T[] = [];
    protected _isLocked: boolean = false;

    constructor(
        protected readonly httpClient: HttpClient,
        protected readonly url: string,
        protected readonly pageSize: number = SCNGX_DATASOURCE_PAGE_SIZE
    ) {
        super();
        this.initialize();
    }

    public abstract override next(): SCNGXTrack;
    protected abstract override findByItemId(itemId: string | number): Observable<Song>;
    protected abstract initialize();

    /**
     * Close down the playable list and release
     * all resources.
     */
    public override release() {
        if(this._isLocked) {
            this.logger.warn("Releasing a list that was marked as locked is not recommended. A locked list means, the list is still in use elsewhere. Because its released now, the list might not be available anymore.")
        }

        this._dataSourceSubject.next(null);
        this._dataSourceSubject.complete();

        this._readySubject.complete();

        super.release();
    }

    /**
     * Lock the datasource.
     * This will prevent the source from
     * being disconnected when still in use.
     */
    public lock() {
        this._dataSourceSubject.getValue()?.lock();
        this._isLocked = true;
    }

    /**
     * Unlock the datasource.
     * This removes disconnect prevention
     * and allows the source to be disconnected.
     */
    public unlock() {
        this._dataSourceSubject.getValue()?.unlock();
        this._isLocked = false;
    }

    /**
     * Check if the source is locked.
     * @returns True or False
     */
    public isLocked() {
        console.log(this._isLocked)
        return this._isLocked || this._dataSourceSubject.getValue()?.isLocked();
    }
}

export class SCNGXPlayableList extends BasePlayableList<PlaylistItem> {

    constructor(
        httpClient: HttpClient,
        url: string,
        pageSize: number = SCNGX_DATASOURCE_PAGE_SIZE
    ) {
        super(httpClient, url, pageSize);
    }

    public next(): SCNGXTrack {
        const queueItem = this.queue.dequeue();
        
        const track = new SCNGXTrack();
        track.id = queueItem.data.id;
        track.$data = this.findByItemId(queueItem.data.id)
        
        return track;
    }

    protected findByItemId(itemId: string | number): Observable<Song> {
        // Find the item by looking it up via the connected datasource
        return this._dataSourceSubject.getValue().findItemById(itemId).pipe(map((item) => item?.song));
    }

    protected initialize() {
        firstValueFrom(this.httpClient.get<SCDKTracklist<PlaylistItem>>(`${this.url}`).pipe(takeUntil(this._destroySubject))).then((tracklist) => {
            this.logger.log(`Successfully fetched track list from ${this.url}. Setting up dataSource for ui...`)
        
            console.log(tracklist)
                    
            // Add tracks (ids) to the internal list
            // This will also enqueue the item.
            this.tracks = tracklist.items;
            for(const track of tracklist.items) {
                this.add(track.id, track);
            }
        
            // Build new datasource using the 
            // fetched tracklist data
            const datasource = new SCNGXPlaylistDatasource(
                this.httpClient, 
                {
                    url: tracklist.metadataLocation,
                    pageSize: this.pageSize
                },
                this.tracks
            );
                    
            // Push the new datasource
            this._dataSourceSubject.next(datasource);
        }).catch((error: HttpErrorResponse) => {
            console.error(error);
        }).finally(() => {
            this._readySubject.next(true);
        })
    }

    

}