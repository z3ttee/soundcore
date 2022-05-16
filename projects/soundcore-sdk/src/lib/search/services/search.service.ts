import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SCDKResource } from "../../utils/entities/resource";
import { ComplexSearchResult } from "../entities/search-result.model";
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { SC_SEARCHHISTORY_SIZE, SC_SEARCHHISTORY_STORE } from "../../constants";
import { SearchHistoryEntry } from "../entities/history-entry.entity";

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

    this.dbService.getByKey<SearchHistoryEntry>(SC_SEARCHHISTORY_STORE, resource.id).subscribe((exists) => {
      if(!exists) {
        // Add to history if item does not exist
        this.clearHistoryOverflow().subscribe(() => {
          this.dbService.add<SearchHistoryEntry>(SC_SEARCHHISTORY_STORE, new SearchHistoryEntry(resource)).subscribe(() => {
            this._recentlySearchedSubject.next(Array.from(new Set(recentlySearch)));
          });
        });
      } else {
        // Change date to current date
        const updated: SearchHistoryEntry = {
          ...exists,
          createdAt: new Date()
        }

        this.dbService.update(SC_SEARCHHISTORY_STORE, updated).subscribe();
      }
      
    })
    
  }

  private restoreRecentlySearched() {
    this.clearHistoryOverflow().subscribe(() => {
      this.dbService.getAll<SearchHistoryEntry>(SC_SEARCHHISTORY_STORE).subscribe((list) => {
        this._recentlySearchedSubject.next(list.map((entry) => entry.resource));
      })
    })
  }

  private clearHistoryOverflow(): Observable<any> {
    return this.dbService.count(SC_SEARCHHISTORY_STORE).pipe(
      switchMap((count) => {
        if(count > SC_SEARCHHISTORY_SIZE) {
          return this.dbService.getAll<SearchHistoryEntry>(SC_SEARCHHISTORY_STORE).pipe(switchMap((list) => {
            list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            const entry = list.splice(0, 1)[0];
            
            if(!entry) return of(true);
            return this.dbService.delete(SC_SEARCHHISTORY_STORE, entry.id);
          }))
        } else {
          return of(true);
        }
      })
    );
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
