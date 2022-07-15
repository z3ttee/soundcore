import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXScreenService } from 'soundcore-ngx';
import { SCDKSearchService, ComplexSearchResult, SCDKResource, SCDKPlaylistService, ApiSearchResponse, MeiliPlaylist, Pageable } from 'soundcore-sdk';

@Component({
  selector: 'app-search-index',
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss']
})
export class SearchIndexComponent implements OnInit, OnDestroy {

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly searchService: SCDKSearchService,
    private readonly playlistService: SCDKPlaylistService,
    public readonly screenService: SCNGXScreenService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancelQuery: Subject<void> = new Subject();

  private readonly _resultSubject: BehaviorSubject<ComplexSearchResult> = new BehaviorSubject(null);
  public readonly $result: Observable<ComplexSearchResult> = this._resultSubject.asObservable().pipe(takeUntil(this._destroy));
  public readonly $recently: Observable<SCDKResource[]> = this.searchService.$recentlySearched.pipe(takeUntil(this._destroy));

  public show404: boolean = false;
  public query: string = "";
  public readonly searchInputControl: UntypedFormControl = new UntypedFormControl("");

  public $playlists: BehaviorSubject<ApiSearchResponse<MeiliPlaylist>> = new BehaviorSubject(null);

  public ngOnInit(): void {

    this.searchService.$onMainInput.pipe(debounceTime(300), takeUntil(this._destroy)).subscribe((query) => {
      this._cancelQuery.next();
      this.query = query;

      if(typeof query == "undefined" || query == null || query.replace(/\s/g, '') == "") {
        this._resultSubject.next(null);
        this.show404 = false;
        return
      }

      /*this.searchService.performComplexSearch(query).pipe(takeUntil(this._cancelQuery)).subscribe((result) => {
        console.log(result)
        this._resultSubject.next(result);
        this.show404 = !result;
      })*/
      this.playlistService.searchPlaylist(query, new Pageable(0, 10)).pipe(takeUntil(this._cancelQuery)).subscribe((response) => {
        console.log(response);

        this.$playlists.next(response.payload);
      })
    })

    // Push queries that were received from input on mobile devices.
    this.searchInputControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
      this.searchService.emitMainInput(value);
    })
  }

  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();

    this._cancelQuery.next();
    this._cancelQuery.complete();
  }

  public routeToResult(route: any[], resource: SCDKResource) {
    this.searchService.addToSearchHistory(resource);
    this.router.navigate(route);
  }

}
