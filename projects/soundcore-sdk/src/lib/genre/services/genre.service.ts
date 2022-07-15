import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Page } from "../../utils/page/page";
import { Pageable } from "../../utils/page/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Genre } from "../entities/genre.entity";

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
    public findById(genreId: string): Observable<Genre> {
        if(!genreId) of(null);
        return this.httpClient.get<Genre>(`${this.options.api_base_uri}/v1/genres/${genreId}`)
    }

    /**
     * Find a genre by artist. This will lookup the songs of an 
     * artist and will return the genres they are categorized in.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns Observable<Page<Genre>>
     */
    public findByArtist(artistId: string, pageable: Pageable): Observable<Page<Genre>> {
        if(!artistId) return of(Page.of([]))
        return this.httpClient.get<Page<Genre>>(`${this.options.api_base_uri}/v1/genres/byArtist/${artistId}${pageable.toQuery()}`)
    }

}