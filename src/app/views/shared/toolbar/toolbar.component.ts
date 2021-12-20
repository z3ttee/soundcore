import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { ComplexSearchResult } from 'src/app/model/search-result.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() public withMenu: boolean = true;
  @Output() public onMenuToggle: EventEmitter<void> = new EventEmitter()

  public artworkBaseUrl = `${environment.api_base_uri}/v1/artworks/`

  myControl = new FormControl();
  options: string[] = [];
  public $complexSearchResult: Observable<ComplexSearchResult>;

  public isSearching: boolean = false;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.$complexSearchResult = this.myControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(250),
      switchMap((query) => this._filter(query))
    );
  }

  public emitMenuToggle(): void {
    this.onMenuToggle.emit();
  }

  public navigateToSong(event: MouseEvent, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log("navigating to: ", id)
  }

  private _filter(value: string): Observable<ComplexSearchResult> {
    this.isSearching = true;

    return this.httpClient.get(`${environment.api_base_uri}/v1/search/?q=${value.toLowerCase()}`).pipe(catchError((err, caught) => {
      if(!err) {
        return caught;
      } else {
        return of([])
      }
    }),
    tap((value) => console.log(value))) as Observable<ComplexSearchResult>
  }

}
