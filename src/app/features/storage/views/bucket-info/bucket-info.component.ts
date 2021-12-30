import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, from, map, mapTo, Observable, switchMap } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { MountEditorDialog } from '../../dialogs/mount-editor.dialog';
import { StorageBucket } from '../../model/storage-bucket.model';
import { StorageMount } from '../../model/storage-mount.model';
import { BucketService } from '../../services/bucket.service';
import { MountService } from '../../services/mount.service';

@Component({
  templateUrl: './bucket-info.component.html',
  styleUrls: ['./bucket-info.component.scss']
})
export class BucketInfoComponent implements OnInit {

  private _mountsSubject: BehaviorSubject<Page<StorageMount>> = new BehaviorSubject(Page.of([]))
  private _bucketSubject: BehaviorSubject<StorageBucket> = new BehaviorSubject(null)

  public $bucket: Observable<StorageBucket> = this._bucketSubject.asObservable();
  public $availableMounts: Observable<Page<StorageMount>> = this._mountsSubject.asObservable();

  public isLoadingMounts: boolean = false;

  public pageSizeOptions: number[] = [5, 10, 25, 30];
  public selectedPageSize: number = 10;
  public currentPageIndex: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bucketService: BucketService,
    private mountService: MountService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.isLoadingMounts = true;

      const bucketId = paramMap.get("bucketId");
      this.bucketService.findById(bucketId).finally(() => this.isLoadingMounts = false).catch(() => null).then((bucket) => {
        this._bucketSubject.next(bucket);
        this.findMounts();
      });
      
    })
  }

  public async ngOnInit(): Promise<void> {} 

  public async navigateToOverview() {
    this.router.navigate(["storage/"])
  }

  public findMounts(pageable?: Pageable) {

    // Find all mounts by selected bucket
    this.mountService.findMountsByBucketId(this._bucketSubject.getValue()?.id, pageable).then((page) => {
      this._mountsSubject.next(page)
    }).finally(() => {
      this.isLoadingMounts = false;
    })
  }

  public async deleteMount(mount: StorageMount) {
    this.mountService.delete(mount.id).then(() => this.findMounts());
  }

  public openMountEditor(mount?: StorageMount) {
    const dialogRef = this.dialog.open(MountEditorDialog, {
      data: {
        bucket: this._bucketSubject.getValue(),
        isEditMode: !!mount,
        ...{ ...mount }
      }
    })

    dialogRef.afterClosed().subscribe((mount: StorageMount) => {
      this.findMounts()
    })
  }

  public onPageEvent(event: PageEvent) {
    this.findMounts({
      page: event.pageIndex,
      size: event.pageSize
    })
  }

}
