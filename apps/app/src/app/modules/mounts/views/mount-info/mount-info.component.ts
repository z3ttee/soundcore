import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ApplicationInfo, File, Future, Mount, SCDKFileService, SCSDKAdminGateway, SCSDKAppService, SCSDKMountService } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';
import { SCNGXDatasource, SCNGXDialogService } from '@soundcore/ngx';

interface MountInfoProps {
  mount?: Mount;
  loading?: boolean;
  datasource?: SCNGXDatasource<File>;
  appInfo?: ApplicationInfo;
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
  
  private readonly _destroy: Subject<void> = new Subject();
  private readonly $onMountUpdated: Subject<Mount> = new Subject();

  public readonly $deletingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $setAsDefaultStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $refreshStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public $props: Observable<MountInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy),
      map((paramMap) => paramMap.get("mountId")),
      switchMap((mountId) => this.mountService.findById(mountId)),
      map((request): [Future<Mount>, SCNGXDatasource] => ([
        request,
        request.loading ? null : new SCNGXDatasource(this.httpClient, this.fileService.findByMountIdBaseURL(request.data?.id))
      ]))
    ),
    this.$onMountUpdated.asObservable().pipe(startWith(null)),
    this.appService.$appInfo.pipe(takeUntil(this._destroy))
  ]).pipe(
    map(([[request, datasource], onMountUpdated, appInfo]): MountInfoProps => ({
      loading: request.loading,
      mount: onMountUpdated ?? request.data,
      datasource: datasource,
      appInfo: appInfo
    })),
    takeUntil(this._destroy)
  );

  public ngOnInit(): void {
    this.adminGateway.$mountStatusUpdate.pipe(takeUntil(this._destroy)).subscribe((event) => {
      console.log(event);
    });
  }
  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public deleteMount(mount: Mount) {
    this.setDeleting(true);

    this.dialog.confirm("Möchtest du den Mountpunkt wirklich löschen?", "Mount löschen").$afterClosed.pipe(takeUntil(this._destroy)).subscribe((confirmed) => {
      if(confirmed) {
        this.mountService.deleteById(mount.id).pipe(takeUntil(this._destroy)).subscribe((request) => {
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
    }).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((result) => {
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

    this.mountService.rescanMount(mount.id).pipe(takeUntil(this._destroy)).subscribe((request) => {
      this.setRefreshing(request.loading);
      if(!request.loading) console.log("triggered mount re-index: ", request?.data);
    });
  }

  public setAsDefault(mount: Mount) {
    if(!mount) return;

    this.mountService.setDefault(mount.id).pipe(takeUntil(this._destroy)).subscribe((request) => {
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

}
