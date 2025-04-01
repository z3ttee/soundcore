import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Zone } from '@repo/angular-sdk';
import { SCNGXDatasource } from '@repo/angular-ui';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './zones-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ZonesIndexComponent implements OnInit, OnDestroy {

  constructor(
    private readonly httpClient: HttpClient
  ) {
    this.datasource = new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/zones`, 8);
  }

  private readonly _destroy: Subject<void> = new Subject();
  public readonly datasource: SCNGXDatasource<Zone>;

  public ngOnInit(): void { }
  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

}
