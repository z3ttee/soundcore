import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { ScrollService } from 'src/app/services/scroll.service';
import { Bucket } from '../../entities/bucket.entity';
import { BucketService } from '../../services/bucket.service';

@Component({
  templateUrl: './buckets.component.html',
  styleUrls: ['./buckets.component.scss']
})
export class BucketsComponent implements OnInit, OnDestroy {

  constructor(
    private bucketService: BucketService, 
    private scrollService: ScrollService
  ) {}

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public isLoadingBuckets: boolean = false;
  public errorMessage: string = undefined;

  private _bucketsSubject: BehaviorSubject<Bucket[]> = new BehaviorSubject([]);
  public $buckets: Observable<Bucket[]> = this._bucketsSubject.asObservable();

  // Pagination
  public currentPage: number = 0;
  public pageSize: number = 30;
  public totalElements: number = 0;

  public ngOnInit(): void {
    this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.findBuckets();
    })
  }
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public findBuckets() {
    this.bucketService.findBuckets({ size: this.pageSize, page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements;
      if(page.activePageSize > 0) {
        this.currentPage++;
        this._bucketsSubject.next([
          ...this._bucketsSubject.getValue(),
          ...page.elements
        ])
      }
    }).catch((error) => {
      this.errorMessage = error.message
    })
  }

}
