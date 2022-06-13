import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Observable, Subject, takeUntil } from 'rxjs';
import { InfiniteDataSource } from 'soundcore-ngx';
import { Bucket, SCDKBucketService } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-zones-index',
  templateUrl: './zones-index.component.html',
  styleUrls: ['./zones-index.component.scss']
})
export class ZonesIndexComponent implements OnInit, OnDestroy {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly bucketService: SCDKBucketService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _fetchMore: Subject<IPageInfo> = new Subject();
  public readonly dataSource: InfiniteDataSource<Bucket> = new InfiniteDataSource(this.httpClient, { 
    pageSize: 30, 
    url: `${environment.api_base_uri}/v1/buckets` 
  });
  
  public readonly $items: Observable<Bucket[]> = this.dataSource.$stream.pipe(takeUntil(this._destroy));

  public ngOnInit(): void {

    this.dataSource.connect(this._fetchMore.asObservable())
    /*this.bucketService.findPage(new Pageable(0, 30)).pipe(takeUntil(this._destroy)).subscribe((page) => {
      console.log(page)
    })*/

  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect();
    this._destroy.next();
    this._destroy.complete();
  }

  public fetchMore(info: IPageInfo) {
    this._fetchMore.next(info);
  }

}
