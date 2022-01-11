import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, debounce, debounceTime, filter, Observable, of } from 'rxjs';
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

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.performComplexSearch("");
    
    this.searchInputControl.valueChanges.pipe(debounceTime(200)).subscribe((query) => {
      this.hasSearched = true;
      this.performComplexSearch(query);
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
