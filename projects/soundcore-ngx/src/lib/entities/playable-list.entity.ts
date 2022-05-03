import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, Subject, takeUntil } from "rxjs";
import { Album, Artist, Page, Playlist } from "soundcore-sdk";
import { SCNGXTrackListDataSourceV2 } from "../utils/datasource/datasourcev2";
import { SCNGXLogger } from "../utils/logger/logger";

export interface SCNGXPlayableListUrls {

    /**
     * URL that points to the endpoint which
     * should return all ids of tracks included
     * in a playable list.
     */
    tracksUrl: string;

    /**
     * URL that points to the endpoint which
     * should return all the detailed data of tracks
     * included in a playable list. The data contains
     * information about title, artists, duration etc.
     */
    detailsUrl: string;

}
export class SCNGXTrackID {
    public id: string;
}
export class SCNGXPlayableList {
    private readonly logger: SCNGXLogger = new SCNGXLogger("PlaylistService");

    /**
     * Subject used to destroy subscriptions.
     */
    private readonly _destroySubject: Subject<void> = new Subject();

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

    public readonly id: string;
    public readonly context: Playlist | Album | Artist; 
    
    private tracks: SCNGXTrackID[] = [];
    private readonly queue: SCNGXTrackID[];

    constructor(
        private readonly httpClient: HttpClient,
        private readonly urls: SCNGXPlayableListUrls
    ) {
        this.init();
    }


    /**
     * Close down the playable list and release
     * all resources.
     */
    public release() {
        this._destroySubject.next();
        this._destroySubject.complete();

        this._dataSourceSubject.next(null);
        this._dataSourceSubject.complete();

        this._readySubject.complete();
        this.logger.log(`Destroyed playable list.`)
    }

    /**
     * Make the initial setup like making a request
     * to the tracksUrl endpoint.
     */
    private init() {
        firstValueFrom(this.httpClient.get<Page<SCNGXTrackID>>(`${this.urls.tracksUrl}`).pipe(takeUntil(this._destroySubject))).then((page) => {
            this.logger.log(`Successfully fetched track list from ${this.urls.tracksUrl}. Setting up dataSource for ui...`)

            const dataSource = new SCNGXTrackListDataSourceV2(this.httpClient, {
                url: this.urls.detailsUrl,
                pageSize: 50,
                totalElements: page.totalElements
            })

            this._dataSourceSubject.next(dataSource);
            this.tracks = page.elements;
        }).catch((error: HttpErrorResponse) => {
            console.error(error);
        }).finally(() => {
            this._readySubject.next(true);
        })
    }

}