import { HttpClient } from "@angular/common/http";
import { map, Observable, takeUntil } from "rxjs";
import { PlaylistItem } from "soundcore-sdk";
import { DatasourceOptions } from "./datasource";
import { BaseTracklistDatasource } from "./tracklist-datasource";

export class SCNGXPlaylistDatasource extends BaseTracklistDatasource<PlaylistItem> {

    constructor(
        httpClient: HttpClient,
        options: DatasourceOptions,
        private readonly items: PlaylistItem[]
    ) {
        super(httpClient, options);
    }

    /**
     * Find song metadata by track value.
     * @param itemId 
     * @returns 
     */
    public findItemById(itemId: number): Observable<PlaylistItem> {
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
     * @param itemId Track data
     * @returns Page number
     */
    protected getPageForItem(itemId: number): number {
        const index = this.items.findIndex((t) => t.id == itemId);
        return this.getPageForIndex(index);
    }

}