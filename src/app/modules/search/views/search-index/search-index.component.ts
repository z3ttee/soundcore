import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXScreenService } from 'soundcore-ngx';
import { SCDKSearchService, ComplexSearchResult, SCDKResource } from 'soundcore-sdk';

@Component({
  selector: 'app-search-index',
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss']
})
export class SearchIndexComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancelQuery: Subject<void> = new Subject();

  private readonly _resultSubject: BehaviorSubject<ComplexSearchResult> = new BehaviorSubject(null);
  public readonly $result: Observable<ComplexSearchResult> = this._resultSubject.asObservable().pipe(takeUntil(this._destroy));

  private readonly _recentlySubject: BehaviorSubject<SCDKResource[]> = new BehaviorSubject([]);
  public readonly $recently: Observable<SCDKResource[]> = this._recentlySubject.asObservable().pipe(takeUntil(this._destroy));

  public show404: boolean = false;
  public readonly searchInputControl: FormControl = new FormControl("");

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly searchService: SCDKSearchService,
    public readonly screenService: SCNGXScreenService
  ) { }

  public ngOnInit(): void {

    this.searchService.$onMainInput.pipe(debounceTime(300), takeUntil(this._destroy)).subscribe((query) => {
      this._cancelQuery.next();

      if(typeof query == "undefined" || query == null || query.replace(/\s/g, '') == "") {
        this._resultSubject.next(null);
        this.show404 = false;
        return
      }

      this.searchService.performComplexSearch(query).pipe(takeUntil(this._cancelQuery)).subscribe((result) => {
        console.log(result)
        this._resultSubject.next(result);
        this.show404 = !result;
      })
    })

    this.searchService.$recentlySearched.pipe(takeUntil(this._destroy)).subscribe((list) => {
      console.log(list)
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
