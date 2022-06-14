import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Subject } from 'rxjs';
import { SCDKBucketService } from 'soundcore-sdk';
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
  
  public readonly infiniteFetchUrl: string = `${environment.api_base_uri}/v1/buckets`;
  public readonly infinitePageSize: number = 30;

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  public fetchMore(info: IPageInfo) {
    this._fetchMore.next(info);
  }

}
