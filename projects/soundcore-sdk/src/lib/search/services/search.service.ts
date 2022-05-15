import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SCDKResource } from "../../utils/entities/resource";
import { ComplexSearchResult } from "../entities/search-result.model";
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { SC_SEARCHHISTORY_STORE } from "../../constants";

@Injectable()
export class SCDKSearchService {

  private readonly _onMainInputSubject: BehaviorSubject<string> = new BehaviorSubject("");
  public readonly $onMainInput: Observable<string> = this._onMainInputSubject.asObservable();

  private readonly _recentlySearchedSubject: BehaviorSubject<SCDKResource[]> = new BehaviorSubject([]);
  public readonly $recentlySearched: Observable<SCDKResource[]> = this._recentlySearchedSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private readonly dbService: NgxIndexedDBService,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) {
    this.restoreRecentlySearched();
  }

  public performComplexSearch(query: string): Observable<ComplexSearchResult> {
    return this.httpClient.get<ComplexSearchResult>(`${this.options.api_base_uri}/v1/search/?q=${query.toLowerCase()}`);
  }

  public emitMainInput(query: string): void {
    this._onMainInputSubject.next(query);
  }

  public addToSearchHistory(resource: SCDKResource) {
    const recentlySearch = this._recentlySearchedSubject.getValue();
    recentlySearch.push(resource);

    this.dbService.add(SC_SEARCHHISTORY_STORE, resource, resource.id);
    this._recentlySearchedSubject.next(Array.from(new Set(recentlySearch)));
  }

  private restoreRecentlySearched() {
    this.dbService.getAll<SCDKResource>(SC_SEARCHHISTORY_STORE).subscribe((list) => {
      this._recentlySearchedSubject.next(list);
    })
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
