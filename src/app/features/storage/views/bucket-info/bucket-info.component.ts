import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, ChartItem } from 'chart.js';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { ScrollService } from 'src/app/services/scroll.service';
import { MountEditorDialog } from '../../dialogs/mount-editor.dialog';
import { Bucket } from '../../entities/bucket.entity';
import { Mount } from '../../entities/mount.entity';
import { BucketService } from '../../services/bucket.service';
import { MountStatusService } from '../../services/mount-status.service';
import { MountService } from '../../services/mount.service';

@Component({
  templateUrl: './bucket-info.component.html',
  styleUrls: ['./bucket-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BucketInfoComponent implements OnInit, OnDestroy {

  constructor(
    private activatedRoute: ActivatedRoute,
    private bucketService: BucketService,
    private mountService: MountService,
    private scrollService: ScrollService,
    private dialog: MatDialog,
    public mountStatusService: MountStatusService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public isLoadingMounts: boolean = false;

  // Data providers
  private bucketId: string;
  private _mountsSubject: BehaviorSubject<Mount[]> = new BehaviorSubject([])
  private _bucketSubject: BehaviorSubject<Bucket> = new BehaviorSubject(null)

  public $bucket: Observable<Bucket> = this._bucketSubject.asObservable();
  public $mounts: Observable<Mount[]> = this._mountsSubject.asObservable();

  // Pagination
  public currentPage: number = 0;
  public pageSize: number = 30;
  public totalElements: number = 0;

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.bucketId = paramMap.get("bucketId");

      this.bucketService.findById(this.bucketId).finally(() => this.isLoadingMounts = false).catch(() => null).then((bucket) => {
        this._bucketSubject.next(bucket);
      });

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.findMounts();
      })
    })
  } 
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public findMounts() {
    // Find all mounts by selected bucket
    this.mountService.findMountsByBucketId(this.bucketId, { size: this.pageSize, page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements;

      if(page.elements.length > 0) {
        this.currentPage++;
        this._mountsSubject.next([
          ...this._mountsSubject.getValue(),
          ...page.elements
        ])
      }
      
    })
  }

  public async deleteMount(mount: Mount) {
    this.mountService.delete(mount.id).then(() => {
      this._mountsSubject.next(this._mountsSubject.getValue().filter((m) => m.id != mount.id))
    });
  }

  public openMountEditor(mount?: Mount) {
    const dialogRef = this.dialog.open(MountEditorDialog, {
      data: {
        bucket: this._bucketSubject.getValue(),
        isEditMode: !!mount,
        ...{ ...mount }
      }
    })

    dialogRef.afterClosed().subscribe((mount: Mount) => {
      if(mount) {
        const mounts = this._mountsSubject.getValue();
        const index = mounts.findIndex((m) => m.id == mount.id);

        if(index == -1) {
          mounts.push(mount);
        } else {
          mounts[index] = mount;
        }
        
        this._mountsSubject.next(mounts)
      }
    })
  }

}
