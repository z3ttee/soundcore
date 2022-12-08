import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Page } from "../../pagination";
import { Pageable } from "../../pagination/pageable";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Future, toFuture } from "../../utils/future";
import { LikedResource } from "../entities/like.entity";

@Injectable()
export class SCSDKLibraryService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    public buildDatasourceUrl(userId?: string): string {
        return `${this.options.api_base_uri}/v1/libraries/${userId}`;
    }

    /**
     * Find a page of library contents of a user.
     * @param pageable 
     * @returns 
     */
    public findPageByUser(pageable: Pageable): Observable<Future<Page<LikedResource | Playlist>>> {
        return this.httpClient.get<Page<LikedResource | Playlist>>(`${this.buildDatasourceUrl()}${pageable.toQuery()}`).pipe(toFuture());
    }

}