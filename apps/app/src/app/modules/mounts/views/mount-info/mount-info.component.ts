import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService, SCNGXInfiniteDataSource } from '@soundcore/ngx';
import { File, Mount, SCDKFileService, SCDKMountService } from '@soundcore/sdk';
import { AppMountCreateDialog, MountCreateDialogOptions } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.component';

@Component({
  selector: 'app-mount-info',
  templateUrl: './mount-info.component.html',
  styleUrls: ['./mount-info.component.scss']
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
  private readonly _mountSubject: BehaviorSubject<Mount> = new BehaviorSubject(null);

  public readonly $loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $deleting: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $mount: Observable<Mount> = this._mountSubject.asObservable();

  public dataSource: SCNGXInfiniteDataSource<File>;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((params) => {
      const mountId = params.get("mountId");

      // Reset and set state
      // to loading.
      this._mountSubject.next(null);
      this.$loading.next(true);

      this.dataSource = new SCNGXInfiniteDataSource(this.httpClient, {
        url: this.fileService.findByMountIdBaseURL(mountId)
      });

      // Find mount and update state
      this.mountService.findById(mountId).pipe(takeUntil(this._destroy)).subscribe((mount) => {
        this.$loading.next(false);
        this._mountSubject.next(mount);
      });
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public deleteMount() {
    this.dialog.confirm("Mount löschen", "Möchtest du den Mounpunkt wirklich löschen?").$afterClosed.pipe(takeUntil(this._destroy)).subscribe((confirmed) => {
      if(confirmed) {
        this.$deleting.next(true);
        this.mountService.deleteById(this._mountSubject.getValue().id).pipe(takeUntil(this._destroy)).subscribe((response) => {
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

  public openMountEditorDialog() {
    if(!this._mountSubject.getValue()) return;

    this.dialog.open<any, MountCreateDialogOptions, Mount>(AppMountCreateDialog, {
      data: {
        data: this._mountSubject.getValue(),
        mode: "edit"
      }
    }).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((result) => {
      if(!!result) {
        this._mountSubject.next({
          ...this._mountSubject.getValue(),
          ...result
        });
      }
    })

  }

}
