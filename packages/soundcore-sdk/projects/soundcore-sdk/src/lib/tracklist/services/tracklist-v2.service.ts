import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Pageable, isNull } from "@soundcore/common";
import { Observable, of } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKOptions } from "../../scdk.module";
import { Future, toFuture } from "../../utils/future";
import { TracklistV2 } from "../entities/tracklist-v2.entity";
import { PlayableEntityType } from "../entities/playable.entity";

@Injectable()
export class SCSDKTracklistV2Service {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    public getHttpClient(): HttpClient {
        return this.httpClient;
    }

    /**
     * Find tracklist entity by an album
     * @param albumId Album's id
     * @returns Tracklist
     */
    public findByAlbum(albumId: string, shuffled: boolean = false): Observable<Future<TracklistV2>> {
        if(isNull(albumId)) return of(Future.notfound());
        return this.httpClient.get<TracklistV2>(`${this.options.api_base_uri}/v2/tracklists/${PlayableEntityType.ALBUM.toLowerCase()}/${albumId}${new Pageable(0, 15).toQuery()}&shuffled=${encodeURIComponent(shuffled)}`).pipe(toFuture());
    }

    /**
     * Find tracklist entity by an artist
     * @param artistId Artist's id
     * @returns Tracklist
     */
    public findByArtist(artistId: string, shuffled: boolean = false): Observable<Future<TracklistV2>> {
        if(isNull(artistId)) return of(Future.notfound());
        return this.httpClient.get<TracklistV2>(`${this.options.api_base_uri}/v2/tracklists/${PlayableEntityType.ARTIST.toLowerCase()}/${artistId}${new Pageable(0, 15).toQuery()}&shuffled=${encodeURIComponent(shuffled)}`).pipe(toFuture());
    }

}
