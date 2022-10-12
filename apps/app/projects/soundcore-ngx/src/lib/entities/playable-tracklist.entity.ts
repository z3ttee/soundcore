import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom, Observable, takeUntil } from "rxjs";
import { Song, SCDKTracklist } from "@soundcore/sdk";
import { SCNGX_DATASOURCE_PAGE_SIZE } from "../utils/datasource/datasource";
import { SCNGXTracklistDatasource } from "../utils/datasource/tracklist-datasource";
import { BasePlayableList } from "./playable-list.entity";
import { SCNGXTrack } from "./playable-source.entity";

export class SCNGXPlayableTracklist extends BasePlayableList<Song> {

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
        return this._dataSourceSubject.getValue().findItemById(itemId);
    }

    /**
     * Make the initial setup like making a request
     * to the tracksUrl endpoint.
     */
    protected initialize() {
        firstValueFrom(this.httpClient.get<SCDKTracklist<Song>>(`${this.url}`).pipe(takeUntil(this._destroySubject))).then((tracklist) => {
            this.logger.log(`Successfully fetched track list from ${this.url}. Setting up dataSource for ui...`)

            console.log(tracklist)
            
            this.tracks = tracklist.items;
            for(const track of tracklist.items) {
                this.add(track.id, track);
            }

            const datasource = new SCNGXTracklistDatasource(
                this.httpClient, 
                {
                    url: tracklist.metadataLocation,
                    pageSize: this.pageSize
                },
                this.tracks
            );
            
            this._dataSourceSubject.next(datasource);
        }).catch((error: HttpErrorResponse) => {
            console.error(error);
        }).finally(() => {
            this._readySubject.next(true);
        })
    }

}