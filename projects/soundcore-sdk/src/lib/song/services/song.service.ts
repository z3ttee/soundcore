import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Page } from "../../pagination/page";
import { Pageable } from "../../pagination/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Song } from "../entities/song.entity";

@Injectable()
export class SCDKSongService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find the top songs by an artist.
     * @param artistId Artist's id
     * @returns Observable<Page<Song>>
     */
    public findTopSongsByArtist(artistId: string): Observable<Page<Song>> {
        if(!artistId) return of(null);
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byArtist/${artistId}/top`)
    }

    /**
     * Find songs by an artist categorized in a specific genre.
     * @param genreId Genre's id
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns Observable<Page<Song>>
     */
    public findSongsByGenreAndArtist(genreId: string, artistId: string, pageable: Pageable): Observable<Page<Song>> {
        if(!genreId || !artistId) return of(Page.of([]))
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byGenre/${genreId}/byArtist/${artistId}${Pageable.toQuery(pageable)}`);
    }

    /**
     * Find songs of the user's collection
     * @param pageable Page settings
     * @returns Observable<Page<Song>>
     */
    public findSongsByCollection(pageable: Pageable): Observable<Page<Song>> {
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byCollection${Pageable.toQuery(pageable)}`)
    }

    /**
     * Find song by an artist and which the user has added to his collection.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns 
     */
    public findSongsByCollectionAndArtist(artistId: string, pageable: Pageable): Observable<Page<Song>> {
        if(!artistId) return of(Page.of([]))
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byCollection/byArtist/${artistId}${Pageable.toQuery(pageable)}`)
    }

}