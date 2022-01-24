import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, map, Observable, of, take } from 'rxjs';
import { ComplexSearchResult } from '../../entities/search-result.model';
import { SearchService } from '../../services/search.service';

@Component({
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss']
})
export class SearchIndexComponent implements OnInit {

  @ViewChild('searchInputField') input;

  private _currentResultSubject: BehaviorSubject<ComplexSearchResult> = new BehaviorSubject(null);
  public $currentResult: Observable<ComplexSearchResult> = this._currentResultSubject.asObservable();
  public searchInputControl: FormControl = new FormControl("");

  public $history: Observable<string[]> = of([])

  public isSearching: boolean = false;
  public hasSearched: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private searchService: SearchService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.pipe(take(1), map((query) => query.get("q"))).subscribe((query) => {
      if(query) {
        this.searchInputControl.setValue(query);
        this.hasSearched = true;
        this.performComplexSearch(query);
      } else {
        this.performComplexSearch("");
      }

      this.searchInputControl.valueChanges.pipe(debounceTime(200)).subscribe((input) => {
        const queryParams = input && input != "" ? { q: input } : {};
  
        this.router.navigate([], {
          replaceUrl: true,
          relativeTo: this.activatedRoute,
          queryParams
        })
        
        this.hasSearched = true;
        this.performComplexSearch(input);
      })
    })
  }

  public async performComplexSearch(query: string) {
    this.isSearching = true;
    this.searchService.performComplexSearch(query)
        .then((result) => {
          console.log(result)
          this._currentResultSubject.next(result)
        }).catch((reason: HttpErrorResponse) => {
          console.error(reason.error)
        }).finally(() => {
          this.isSearching = false;
    });
  }
}
