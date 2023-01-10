import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, debounceTime, filter, map, Observable, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ApplicationInfo, File, Future, Mount, MountProgress, MountStatus, MountStatusUpdateEvent, SCDKFileService, SCSDKAdminGateway, SCSDKAppService, SCSDKMountService } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';
import { SCNGXDatasource, SCNGXDialogService } from '@soundcore/ngx';

interface MountInfoProps {
  mount?: Mount;
  status?: MountStatus;

  loading?: boolean;
  datasource?: SCNGXDatasource<File>;
  appInfo?: ApplicationInfo;
  process?: MountProgress;
  processEvent?: MountStatusUpdateEvent;
}

@Component({
  templateUrl: './mount-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MountInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly mountService: SCSDKMountService,
    private readonly fileService: SCDKFileService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly httpClient: HttpClient,
    private readonly dialog: SCNGXDialogService,
    private readonly snackbar: MatSnackBar,
    private readonly appService: SCSDKAppService,
    private readonly adminGateway: SCSDKAdminGateway
  ) { }

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;
  
  private readonly $destroy: Subject<void> = new Subject();
  private readonly $reload: Subject<void> = new Subject();

  private readonly $onMountUpdated: Subject<Mount> = new Subject();
  private readonly $onMountStatusUpdate: Subject<MountStatusUpdateEvent> = new Subject();

  public readonly $deletingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $setAsDefaultStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $refreshStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private currentMountId: string;
  private lastMountStatus: MountStatus;

  /**
   * Observable that emits current
   * mount id.
   */
  public $mountId: Observable<string> = combineLatest([
    this.$reload.pipe(startWith(null), takeUntil(this.$destroy)),
    this.activatedRoute.paramMap.pipe(map((params) => params.get("mountId")), takeUntil(this.$destroy))
  ]).pipe(map(([_, mountId]) => mountId), tap(() => console.log(`[${MountInfoComponent.name}] Reloading page data...`)));

  /**
   * Observable that emits current
   * mount data.
   */
  public $mount: Observable<Future<Mount>> = this.$mountId.pipe(
    switchMap((mountId) => this.mountService.findById(mountId)),
    switchMap((request) => this.$onMountUpdated.pipe(
      startWith(null), 
      map((updated) => Future.merge(request, updated)),
      takeUntil(this.$destroy)
    ))
  );

  /**
   * Observable that emits current datasource
   * fitting to the mountId
   */
  public $datasource: Observable<SCNGXDatasource<File>> = this.$mountId.pipe(
    map((mountId) => new SCNGXDatasource<File>(this.httpClient, this.fileService.findByMountIdBaseURL(mountId))),
  );

  public $processEvent: Observable<MountStatusUpdateEvent> = this.$mount.pipe(
    switchMap((request) => this.adminGateway.$mountStatusUpdate.pipe(
      filter((event) => event?.mountId === request?.data?.id),
      startWith(null),
      takeUntil(this.$destroy)
    ))
  );

  public $props: Observable<MountInfoProps> = combineLatest([
    this.appService.$appInfo.pipe(takeUntil(this.$destroy)),
    this.$mount,
    this.$datasource,
    this.$processEvent
  ]).pipe(
    map(([appInfo, request, datasource, processEvent]): MountInfoProps => ({
      appInfo: appInfo,
      datasource: datasource,
      loading: request.loading,
      mount: request.data,
      process: processEvent?.progressPayload,
      processEvent: processEvent
    })),
    tap(({ processEvent }) => {
      !!processEvent?.status && processEvent?.status != MountStatus.ENQUEUED && processEvent?.status != MountStatus.BUSY && this.reload()
    })
  );

  public ngOnInit(): void {
    this.adminGateway.$mountStatusUpdate.pipe(takeUntil(this.$destroy)).subscribe((event) => {
      if(this.currentMountId !== event.mountId) return;
      this.$onMountStatusUpdate.next(event);
    });
  }
  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();
  }

  public deleteMount(mount: Mount) {
    this.setDeleting(true);

    this.dialog.confirm("Möchtest du den Mountpunkt wirklich löschen?", "Mount löschen").$afterClosed.pipe(takeUntil(this.$destroy)).subscribe((confirmed) => {
      if(confirmed) {
        this.mountService.deleteById(mount.id).pipe(takeUntil(this.$destroy)).subscribe((request) => {
          this.setDeleting(request.loading);

          if(request.loading) return;

          if(request.error) {
            this.snackbar.open(`${request.error.message}`, null, { duration: 5000 });
            return;
          }

          this.router.navigate(["../"], { relativeTo: this.activatedRoute }).then(() => {
            this.snackbar.open(`Mount wurde gelöscht`, null, { duration: 5000 });
          });
        })
      } else {
        this.setDeleting(false);
      }
    });
  }

  public openMountEditorDialog(mount?: Mount) {
    if(!mount) return;

    this.dialog.open<any, MountCreateDialogOptions, Mount>(AppMountCreateDialog, {
      data: {
        data: mount,
        mode: "edit"
      }
    }).$afterClosed.pipe(takeUntil(this.$destroy)).subscribe((result) => {
      if(!!result) {
        this.$onMountUpdated.next({
          ...mount,
          ...result
        });
      }
    })

  }

  public triggerReindex(mount: Mount) {
    if(!mount) return;

    this.mountService.rescanMount(mount.id).pipe(takeUntil(this.$destroy)).subscribe((request) => {
      this.setRefreshing(request.loading);
      if(!request.loading) console.log("triggered mount re-index: ", request?.data);
    });
  }

  public setAsDefault(mount: Mount) {
    if(!mount) return;

    this.mountService.setDefault(mount.id).pipe(takeUntil(this.$destroy)).subscribe((request) => {
      this.setSettingAsDefault(request.loading);
      if(!request.loading) console.log("set default: ", request?.data);
    });
  }


  private setDeleting(isPending: boolean) {
    this.$deletingStatus.next(isPending);
  }

  private setRefreshing(isPending: boolean) {
    this.$refreshStatus.next(isPending);
  }

  private setSettingAsDefault(isPending: boolean) {
    this.$setAsDefaultStatus.next(isPending);
  }

  public reload() {
    this.$reload.next();
  }

}
