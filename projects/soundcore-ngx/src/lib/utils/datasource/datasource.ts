import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, tap } from "rxjs";
import { Page, Pageable } from "soundcore-sdk";

@Injectable()
export class SCDKDataSource<T> {

    private totalElements = 0;
    private currentPageIndex = 0;

    private _fetchUrl: string;
    private _pageSize: number = 30;

    private _subject: BehaviorSubject<T[]> = new BehaviorSubject([]);
    private $items: Observable<T[]> = this._subject.asObservable();

    constructor(
        private readonly httpClient: HttpClient
    ) {}

    public connect(fetchUrl: string, pageSize: number = 30): Observable<T[]> {
        this._fetchUrl = fetchUrl;
        this._pageSize = pageSize;
        return this.$items;
    }

    public next(pageSize?: number): Observable<Page<T>> {
        if(!this._fetchUrl) throw new Error("Datasource is not connected.")
        if(this.totalElements <= this._subject.getValue().length) return of(Page.of([]));

        return this.httpClient.get<Page<T>>(`${this._fetchUrl}${Pageable.toQuery({ page: this.currentPageIndex, size: pageSize || this._pageSize })}`).pipe(tap((page) => {
            this.totalElements = page.totalElements;
            if(page.elements.length > 0) {
                this._pageSize++;
                this._subject.next([
                    ...this._subject.getValue(),
                    ...page.elements
                ])
            }
        }))

    }

    public destroy() {
        this._subject.complete();
    }



}