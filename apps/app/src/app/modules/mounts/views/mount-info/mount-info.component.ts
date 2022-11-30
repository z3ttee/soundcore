import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { File, Future, Mount, SCDKFileService, SCDKMountService, toFuture } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';
import { SCNGXDatasource, SCNGXDialogService } from '@soundcore/ngx';

interface MountInfoProps {
  mount?: Mount;
  loading?: boolean;
  datasource?: SCNGXDatasource<File>;
}

@Component({
  selector: 'app-mount-info',
  templateUrl: './mount-info.component.html',
  styleUrls: ['./mount-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MountInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly mountService: SCDKMountService,
    private readonly fileService: SCDKFileService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly httpClient: HttpClient,
    private readonly dialog: SCNGXDialogService,
    private readonly snackbar: MatSnackBar
  ) { }

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;
  
  private readonly _destroy: Subject<void> = new Subject();
  private readonly _updateMountSubject: BehaviorSubject<Mount> = new BehaviorSubject(null);

  public readonly $deleting: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public $props: Observable<MountInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy),
      map((paramMap) => paramMap.get("mountId")),
      switchMap((mountId) => this.mountService.findById(mountId).pipe(toFuture())),
      map((request): [Future<Mount>, SCNGXDatasource] => {
        if(request.loading) return [request, null];
        return [
          request,
          new SCNGXDatasource(this.httpClient, { url: this.fileService.findByMountIdBaseURL(request.data?.id) })
        ];
      })
    ),
    this._updateMountSubject.asObservable()
  ]).pipe(
    map(([[request, datasource], onMountUpdate]): MountInfoProps => ({
      loading: request.loading,
      mount: onMountUpdate ?? request.data,
      datasource: datasource
    })),
  );

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public deleteMount(mount: Mount) {
    this.dialog.confirm("Mount löschen", "Möchtest du den Mounpunkt wirklich löschen?").$afterClosed.pipe(takeUntil(this._destroy)).subscribe((confirmed) => {
      if(confirmed) {
        this.$deleting.next(true);
        this.mountService.deleteById(mount.id).pipe(takeUntil(this._destroy)).subscribe((response) => {
          this.$deleting.next(false);

          if(response.error) {
            this.snackbar.open(`${response.message}`, null, { duration: 5000 });
            return;
          }

          this.router.navigate(["../"], { relativeTo: this.activatedRoute }).then(() => {
            this.snackbar.open(`Mount wurde gelöscht`, null, { duration: 5000 });
          });
        })
      }
    })
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
        this._updateMountSubject.next({
          ...mount,
          ...result
        });
      }
    })

  }

}
