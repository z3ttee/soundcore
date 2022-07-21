import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MeiliPlaylist } from '../../meilisearch/entities/meili-playlist.entity';
import { ApiSearchResponse } from '../../meilisearch/entities/search-response.entity';
import { SCDKOptions, SCDK_OPTIONS } from '../../scdk.module';
import { Pageable } from '../../utils/page/pageable';
import { ApiResponse } from '../../utils/responses/api-response';
import { apiResponse } from '../../utils/rxjs/operators/api-response';

@Injectable({
  providedIn: 'root'
})
export class SCDKPlaylistService {

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) { }

  /**
   * Search playlists by a given query.
   * @param {string} query Search query
   * @param {Pageable} pageable Page settings
   * @returns {ApiResponse<ApiSearchResponse<MeiliPlaylist>>} ApiResponse<ApiSearchResponse<MeiliPlaylist>>
   */
  public searchPlaylist(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliPlaylist>>> {
    return this.httpClient.get<ApiSearchResponse<MeiliPlaylist>>(`${this.options.api_base_uri}/v1/search/playlists/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
  }

}
