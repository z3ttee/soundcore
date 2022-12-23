import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Bucket } from '@soundcore/sdk';
import { environment } from 'src/environments/environment';
import { SCNGXDatasource } from '@soundcore/ngx';

@Component({
  selector: 'app-zones-index',
  templateUrl: './zones-index.component.html',
  styleUrls: ['./zones-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZonesIndexComponent implements OnInit, OnDestroy {

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  public readonly datasource: SCNGXDatasource<Bucket> = new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/buckets`, 8)

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

}
