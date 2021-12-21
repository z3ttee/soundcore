import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { MountEditorDialog } from '../../dialogs/mount-editor.dialog';
import { StorageBucket } from '../../model/storage-bucket.model';
import { StorageMount } from '../../model/storage-mount.model';
import { BucketService } from '../../services/bucket.service';
import { MountService } from '../../services/mount.service';

@Component({
  selector: 'asc-admin-index',
  templateUrl: './admin-index.component.html',
  styleUrls: ['./admin-index.component.scss']
})
export class AdminIndexComponent implements OnInit {

  public pageSizeOptions: number[] = [5, 10, 25, 30];
  public selectedPageSize: number = 10;
  public currentPageIndex: number = 0;

  private _mountsSubject: BehaviorSubject<Page<StorageMount>> = new BehaviorSubject(Page.of([]));

  public bucketControl = new FormControl("")
  public availableBuckets: Page<StorageBucket>;

  public $availableMounts: Observable<Page<StorageMount>> = this._mountsSubject.asObservable();

  public isLoadingMounts: boolean = false;

  constructor(private bucketService: BucketService, private mountService: MountService, private dialog: MatDialog) {}

  public async ngOnInit(): Promise<void> {
    // Subscribe to form control changes.
    this.bucketControl.valueChanges.subscribe(() => {

      // Find all mounts by selected bucket
      this.findMounts();
    })

    // Find all available buckets
    this.availableBuckets = await this.bucketService.findAvailableBuckets().then((page) => {
      if(page.elements && page.elements.length > 0) {
        // Select first bucket
        this.bucketControl.patchValue(page.elements[0])
      }
      return page;
    });
  }

  public onPageEvent(event: PageEvent) {
    this.findMounts({
      page: event.pageIndex,
      size: event.pageSize
    })
  }

  public findMounts(pageable: Pageable = { page: this.currentPageIndex, size: this.selectedPageSize }) {
    this.isLoadingMounts = true;

    // Find all mounts by selected bucket
    this.mountService.findMountsByBucketId(this.bucketControl.value?.id, pageable).then((page) => {
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
        bucket: this.bucketControl.value,
        isEditMode: !!mount,
        ...{ ...mount }
      }
    })

    dialogRef.afterClosed().subscribe((mount: StorageMount) => {
      this.findMounts()
    })
  }

}
