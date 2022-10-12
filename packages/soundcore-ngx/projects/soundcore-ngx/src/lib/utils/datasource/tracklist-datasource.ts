import { HttpClient } from "@angular/common/http";
import { map, Observable, takeUntil } from "rxjs";
import { Song, } from "@soundcore/sdk";
import { SCNGXLogger } from "../logger/logger";
import { BaseDatasource, DatasourceOptions } from "./datasource";

export abstract class BaseTracklistDatasource<T> extends BaseDatasource<T> {
    private readonly logger: SCNGXLogger = new SCNGXLogger("DATASOURCE");

    constructor(
        httpClient: HttpClient,
        options: DatasourceOptions,
    ) {
        super(httpClient, options);
    }

    private _isLocked: boolean = false;

    /**
     * Disconnect the datasource.
     * This unsubscribes all subscriptions and releases
     * resources.
     */
    public override disconnect(): void {
        if(this._isLocked) {
            this.logger.warn("Disconnecting a datasource that was marked as locked is not recommended. A locked datasource means, the source is still in use elsewhere. Because its disconencted now, the source might not be available anymore.")
            return;
        }

        super.disconnect();
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
     * Get the calculated page number of a track value.
     * This is usefull if the page containing a specific track
     * is needed, but has not been fetched yet.
     * @param itemId Track data
     * @returns Page number
     */
    protected abstract getPageForItem(itemId: string | number): number;

    /**
     * Find song metadata by track value.
     * @param itemId 
     * @returns 
     */
    public abstract findItemById(itemId: string | number): Observable<T>;
}

/**
 * Class used for tracklists as seen on artist, 
 * album and collection page
 */
export class SCNGXTracklistDatasource extends BaseTracklistDatasource<Song> {
    
    constructor(
        httpClient: HttpClient,
        options: DatasourceOptions,
        private readonly tracklistItems: Song[]
    ) {
        super(httpClient, options);
    }


    /**
     * Find song metadata by track value.
     * @param track 
     * @returns 
     */
    public findItemById(itemId: string): Observable<Song> {
        // TODO: Known issue: If the page is already in process of fetching, null will be returned (see _fetchPage()).
        /*const item = this._cachedMap.get(trackId);
        if(item) return of(item.data);*/

        const pageNr = this.getPageForItem(itemId);

        return this.fetchPage(pageNr).pipe(
            map((items) => items.find((item) => item.data.id == itemId)?.data),
            takeUntil(this._destroy)
        );   
    }

    /**
     * Get the calculated page number of a track value.
     * This is usefull if the page containing a specific track
     * is needed, but has not been fetched yet.
     * @param trackId Track data
     * @returns Page number
     */
    protected getPageForItem(trackId: string): number {
        const index = this.tracklistItems.findIndex((t) => t.id == trackId);
        return this.getPageForIndex(index);
    }
}