import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService } from '@soundcore/ngx';
import { Bucket, Mount, SCDKBucketService, SCSDKAdminGateway } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './zone-info.component.html',
  styleUrls: ['./zone-info.component.scss'],
})
export class ZoneInfoComponent implements OnInit, OnDestroy {

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


  public ngOnInit(): void {
    // Observe route params changes and get new zoneId
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((params) => {
      const zoneId = params.get("zoneId");

      // Set loading state
      this.$loading.next(true);

      // Fetch zone by id
      this.zoneService.findById(zoneId).pipe(takeUntil(this._destroy)).subscribe((zone) => {
        this._zoneSubject.next(zone);
        this.$loading.next(false);
      });
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public openMountCreateDialog() {
    if(!this._zoneSubject.getValue()) return;

    this.dialog.open<any, MountCreateDialogOptions, Mount>(AppMountCreateDialog, {
      data: {
        bucketId: this._zoneSubject.getValue().id
      }
    }).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((result) => {
      // if(result != null) this.dataSource.append(result);
    })

  }
}
