import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { MeiliArtist } from "../../meilisearch/entities/meili-artist.entity";
import { ApiSearchResponse } from "../../meilisearch/entities/search-response.entity";
import { SCSDKOptions } from "../../scdk.module";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { Artist } from "../entities/artist.entity";
import { SCSDK_OPTIONS } from "../../constants";
import { Pageable } from "@soundcore/common";
import { Future } from "../../utils/future/future";
import { toFuture } from "../../utils/future";

@Injectable()
export class SCSDKArtistService {

  constructor(
    private httpClient: HttpClient,
    @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
  ) { }

  /**
   * Find an artist by its id.
   * @param artistId Artist's id
   * @returns Observable<Artist>
   */
  public findById(artistId: string): Observable<Future<Artist>> {
    if(!artistId) return of(Future.notfound());
    return this.httpClient.get<Artist>(`${this.options.api_base_uri}/v1/artists/${artistId}`).pipe(toFuture())
  }

  /**
   * Search artists by a given query.
   * @param {string} query Search query
   * @param {Pageable} pageable Page settings
   * @returns {ApiResponse<ApiSearchResponse<MeiliArtist>>} ApiResponse<ApiSearchResponse<MeiliArtist>> 
   */
  public searchArtist(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliArtist>>> {
    return this.httpClient.get<ApiSearchResponse<MeiliArtist>>(`${this.options.api_base_uri}/v1/search/artists/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
  }

}
