import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, takeUntil } from "rxjs";
import { Album, Artist, Page, Playlist, Song, SCDKTracklist } from "soundcore-sdk";
import { SCNGXTrackListDataSourceV2 } from "../utils/datasource/datasourcev2";
import { SCNGXPlayableSource, SCNGXTrackID } from "./playable-source.entity";

export class SCNGXPlayableList extends SCNGXPlayableSource {

    /**
     * Ready subject that pushes new values to the $ready observable.
     * Both indicate, wether the playable list was initialized or not.
     * The list is initialized, after the request to the tracksUrl endpoint
     * was made and the result was processed. After that the $ready
     * observable will emit "true"
     */
    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * Emits the initialization status of the playable list.
     * If false is emitted, the list is making a request to the tracksUrl endpoint
     * to retrieve page settings etc. It emits true as soon as this has happened.
     */
    public readonly $ready: Observable<boolean> = this._readySubject.asObservable().pipe(takeUntil(this._destroySubject));

    /**
     * Subject used to emit new values to $dataSource observable
     */
    private readonly _dataSourceSubject: BehaviorSubject<SCNGXTrackListDataSourceV2> = new BehaviorSubject(null);

    /**
     * Observable that emits current dataSource object. The only reason to use an observable here is
     * because of the playable list design. On initialization, the list makes a request to the tracksUrl endpoint.
     * Only after this was performed, the dataSource becomes available.
     */
    public readonly $dataSource: Observable<SCNGXTrackListDataSourceV2> = this._dataSourceSubject.asObservable().pipe(takeUntil(this._destroySubject));
    public readonly $onReleased: Observable<void> = this._destroySubject.asObservable();

    public readonly context: Playlist | Album | Artist;
    private tracks: SCNGXTrackID[] = [];
    private _isLocked: boolean = false;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly url: string
    ) {
        super();
        this.init();
    }

    protected findByTrack(track: SCNGXTrackID): Observable<Song> {
        return this._dataSourceSubject.getValue().findByTrack(track);
    }

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
     * Make the initial setup like making a request
     * to the tracksUrl endpoint.
     */
    private init() {
        firstValueFrom(this.httpClient.get<SCDKTracklist>(`${this.url}`).pipe(takeUntil(this._destroySubject))).then((tracklist) => {
            this.logger.log(`Successfully fetched track list from ${this.url}. Setting up dataSource for ui...`)

            console.log(tracklist)
            
            this.tracks = tracklist.items;
            this.addAll(tracklist.items);

            const dataSource = new SCNGXTrackListDataSourceV2(
                this.httpClient, 
                {
                    url: tracklist.metadataLocation,
                    totalElements: tracklist.size
                },
                this.tracks
            );
            this._dataSourceSubject.next(dataSource);
        }).catch((error: HttpErrorResponse) => {
            console.error(error);
        }).finally(() => {
            this._readySubject.next(true);
        })
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