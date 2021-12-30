import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { MountEditorDialog } from '../../dialogs/mount-editor.dialog';
import { StorageBucket } from '../../model/storage-bucket.model';
import { StorageMount } from '../../model/storage-mount.model';
import { BucketService } from '../../services/bucket.service';
import { MountService } from '../../services/mount.service';

@Component({
  templateUrl: './buckets.component.html',
  styleUrls: ['./buckets.component.scss']
})
export class BucketsComponent implements OnInit {

  public isLoadingBuckets: boolean = true;
  public errorMessage: string = undefined;

  public pageSizeOptions: number[] = [5, 10, 25, 30];
  public selectedPageSize: number = 10;
  public currentPageIndex: number = 0;

  private _bucketsSubject: BehaviorSubject<Page<StorageBucket>> = new BehaviorSubject(Page.of([]));
  public $availableBuckets: Observable<Page<StorageBucket>> = this._bucketsSubject.asObservable();

  constructor(private bucketService: BucketService, private router: Router) {}

  public async ngOnInit(): Promise<void> {
    this.findBuckets();
  }

  private findBuckets(pageable?: Pageable) {
    this.isLoadingBuckets = true;

    this.bucketService.findAllBuckets(pageable)
      .then((page) => this._bucketsSubject.next(page))
      .catch((error) => this.errorMessage = error.message)
      .finally(() => this.isLoadingBuckets = false)
  }

  public navigateToBucket(bucket: StorageBucket) {
    this.router.navigate(["storage/", bucket.id])
  }

  public onPageEvent(event: PageEvent) {
    this.findBuckets({ size: event.pageSize, page: event.pageIndex })
  }

  

}
