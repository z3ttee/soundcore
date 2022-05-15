import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SCDKSearchableEntity } from "../../utils/entities/searchable";
import { ComplexSearchResult } from "../entities/search-result.model";

@Injectable()
export class SCDKSearchService {

  private readonly _onMainInputSubject: BehaviorSubject<string> = new BehaviorSubject("");
  public readonly $onMainInput: Observable<string> = this._onMainInputSubject.asObservable();


  private readonly _recentlySearchedSubject: BehaviorSubject<SCDKSearchableEntity[]> = new BehaviorSubject([])

  constructor(
    private httpClient: HttpClient,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) { }

  public performComplexSearch(query: string): Observable<ComplexSearchResult> {
    return this.httpClient.get<ComplexSearchResult>(`${this.options.api_base_uri}/v1/search/?q=${query.toLowerCase()}`);
  }

  public emitMainInput(query: string): void {
    this._onMainInputSubject.next(query);
  }

  /*public searchUser(query: string): Observable<SearchResponse<MeiliUser>> {
    return this.httpClient.get<SearchResponse<MeiliUser>>(`${this.options.api_base_uri}/v1/search/users/?q=${query.toLowerCase()}`);
  }

  public searchArtist(query: string): Observable<SearchResponse<MeiliArtist>> {
    return this.httpClient.get<SearchResponse<MeiliArtist>>(`${this.options.api_base_uri}/v1/search/artists/?q=${query.toLowerCase()}`);
  }

  public searchAlbum(query: string): Observable<SearchResponse<MeiliAlbum>> {
    return this.httpClient.get<SearchResponse<MeiliAlbum>>(`${this.options.api_base_uri}/v1/search/albums/?q=${query.toLowerCase()}`);
  }
  
  public searchSong(query: string): Observable<SearchResponse<MeiliSong>> {
    return this.httpClient.get<SearchResponse<MeiliSong>>(`${this.options.api_base_uri}/v1/search/songs/?q=${query.toLowerCase()}`);
  }*/
}
