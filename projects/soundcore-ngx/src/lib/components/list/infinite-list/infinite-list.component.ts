import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { Subject } from 'rxjs';
import { InfiniteDataSource } from '../../../utils/datasource/datasource';

@Component({
  selector: 'scngx-infinite-list',
  templateUrl: './infinite-list.component.html',
  styleUrls: ['./infinite-list.component.scss']
})
export class SCNGXInfiniteListComponent implements OnInit, OnDestroy {
  private _more: Subject<IPageInfo> = new Subject();

  @Input() public fetchUrl: string;
  @Input() public pageSize: number = 30;
  @Input() public parentScroll: HTMLElement;

  public viewPortItems: any[] = [];
  public dataSource: InfiniteDataSource<any>;

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  public ngOnInit(): void {
    this.dataSource = new InfiniteDataSource(this.httpClient, {
      pageSize: this.pageSize,
      url: this.fetchUrl
    });

    this.dataSource?.connect(this._more.asObservable());
  }

  public ngOnDestroy(): void {
      this.dataSource?.disconnect();
  }

  public vsUpdate(visibleItems: any[]) {
    this.viewPortItems = visibleItems;
  }

  public vsEnd(info: IPageInfo) {
    this._more.next(info);
  }

}
