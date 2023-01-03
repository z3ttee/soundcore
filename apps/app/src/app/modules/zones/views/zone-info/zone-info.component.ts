import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { SCNGXDatasource, SCNGXDialogService } from '@soundcore/ngx';
import { ApiError, Bucket, Future, Mount, SCDKBucketService, SCSDKAdminGateway, toFuture } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';
import { environment } from 'src/environments/environment';

interface ZoneInfoProps {
  loading?: boolean;
  datasource?: SCNGXDatasource<Mount>;
  error?: ApiError;
  zone?: Bucket;
}

@Component({
  templateUrl: './zone-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneInfoComponent implements OnDestroy {

  constructor(
    private readonly zoneService: SCDKBucketService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialog: SCNGXDialogService,
    private readonly httpClient: HttpClient,
    private readonly adminGateway: SCSDKAdminGateway
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _zoneSubject: BehaviorSubject<Bucket> = new BehaviorSubject(null);

  public readonly $loading = new BehaviorSubject(false);
  public readonly $zone = this._zoneSubject.asObservable();

  public infiniteFetchUrl: string = "";
  public readonly infinitePageSize: number = 30;

  public readonly $props: Observable<ZoneInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      map((params) => params.get("zoneId")),
      switchMap((zoneId): Observable<[Future<Bucket>, SCNGXDatasource<Mount>]> => {
        return this.zoneService.findById(zoneId).pipe(
          toFuture(),
          map((request): [Future<Bucket>, SCNGXDatasource<Mount>] => {
            if(request.data) return [request, new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/mounts/bucket/${zoneId}`, 8)]
            return [request, null]
          })
        );
      })
    )
  ]).pipe(
    map(([[request, datasource]]): ZoneInfoProps => ({
      loading: request.loading,
      error: request.error,
      datasource: datasource,
      zone: request.data
    })),
    takeUntil(this._destroy)
  );

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public openMountCreateDialog(zone: Bucket, datasource: SCNGXDatasource<Mount>) {
    this.dialog.open<any, MountCreateDialogOptions, Mount>(AppMountCreateDialog, {
      data: {
        bucketId: zone.id
      }
    }).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((result) => {
      if(result != null) datasource.append(result);
    });
  }
}
