import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Genre } from "../entities/genre.entity";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { Page, Pageable } from "../../pagination";

@Injectable({
    providedIn: "root"
})
export class SCDKGenreService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) { }

    /**
     * Find a genre by its id.
     * @param genreId Genre's id.
     * @returns Observable<Genre>
     */
    public findById(genreId: string): Observable<ApiResponse<Genre>> {
        if(!genreId) of(ApiResponse.withPayload(null));
        return this.httpClient.get<Genre>(`${this.options.api_base_uri}/v1/genres/${genreId}`).pipe(apiResponse())
    }

    /**
     * Find a genre by artist. This will lookup the songs of an 
     * artist and will return the genres they are categorized in.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns Observable<Page<Genre>>
     */
    public findByArtist(artistId: string, pageable: Pageable): Observable<ApiResponse<Page<Genre>>> {
        if(!artistId) return of(ApiResponse.withPayload(Page.of([])))
        return this.httpClient.get<Page<Genre>>(`${this.options.api_base_uri}/v1/genres/byArtist/${artistId}${pageable.toQuery()}`).pipe(apiResponse())
    }

    /**
     * Find a page of genres
     * @param pageable Page settings
     * @returns Page<Genre>
     */
    public findAll(pageable: Pageable): Observable<ApiResponse<Page<Genre>>> {
        return this.httpClient.get<Page<Genre>>(`${this.buildFindAllUrl()}${pageable.toQuery()}`).pipe(apiResponse())
    }

    public buildFindAllUrl() {
        return`${this.options.api_base_uri}/v1/genres`
    }

}