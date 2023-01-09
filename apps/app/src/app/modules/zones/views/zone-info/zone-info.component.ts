import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { SCNGXDatasource, SCNGXDialogService } from '@soundcore/ngx';
import { ApiError, ApplicationInfo, Zone, Future, Mount, SCSDKAdminGateway, SCSDKAppService, SCSDKZoneService, toFuture } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';
import { environment } from 'src/environments/environment';

interface ZoneInfoProps {
  loading?: boolean;
  datasource?: SCNGXDatasource<Mount>;
  error?: ApiError;
  zone?: Zone;
  appInfo?: ApplicationInfo;
}

@Component({
  templateUrl: './zone-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneInfoComponent implements OnDestroy {

  constructor(
    private readonly zoneService: SCSDKZoneService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialog: SCNGXDialogService,
    private readonly httpClient: HttpClient,
    private readonly adminGateway: SCSDKAdminGateway,
    private readonly appService: SCSDKAppService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _zoneSubject: BehaviorSubject<Zone> = new BehaviorSubject(null);

  public readonly $loading = new BehaviorSubject(false);
  public readonly $zone = this._zoneSubject.asObservable();

  public infiniteFetchUrl: string = "";
  public readonly infinitePageSize: number = 30;

  public readonly $props: Observable<ZoneInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      map((params) => params.get("zoneId")),
      switchMap((zoneId): Observable<[Future<Zone>, SCNGXDatasource<Mount>]> => {
        return this.zoneService.findById(zoneId).pipe(
          toFuture(),
          map((request): [Future<Zone>, SCNGXDatasource<Mount>] => {
            if(request.data) return [request, new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/mounts/bucket/${zoneId}`, 8)]
            return [request, null]
          })
        );
      })
    ),
    this.appService.$appInfo.pipe(filter((info) => !!info), takeUntil(this._destroy))
  ]).pipe(
    map(([[request, datasource], appInfo]): ZoneInfoProps => ({
      loading: request.loading,
      error: request.error,
      datasource: datasource,
      zone: request.data,
      appInfo: appInfo
    })),
    takeUntil(this._destroy)
  );

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public openMountCreateDialog(zone: Zone, datasource: SCNGXDatasource<Mount>) {
    this.dialog.open<any, MountCreateDialogOptions, Mount>(AppMountCreateDialog, {
      data: {
        bucketId: zone.id
      }
    }).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((result) => {
      if(result != null) datasource.append(result);
    });
  }
}
