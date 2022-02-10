import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { Index } from 'src/app/features/upload/entities/index.entity';
import { ScrollService } from 'src/app/services/scroll.service';
import { StorageMount } from '../../model/storage-mount.model';
import { IndexService } from '../../services/index.service';
import { MountService } from '../../services/mount.service';

@Component({
  templateUrl: './mount-info.component.html',
  styleUrls: ['./mount-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MountInfoComponent implements OnInit, OnDestroy {

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  private mountId: string;
  private _mountSubject: BehaviorSubject<StorageMount> = new BehaviorSubject(null);
  public $mount: Observable<StorageMount> = this._mountSubject.asObservable();

  private _indexSubject: BehaviorSubject<Index[]> = new BehaviorSubject([]);
  public $index: Observable<Index[]> = this._indexSubject.asObservable();

  // Loading states
  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public $isLoading: boolean = false;

  // Pagination
  public totalElements = 0;
  public currentPage = 0;

  constructor(
    private mountService: MountService,
    private indexService: IndexService,
    private scrollService: ScrollService,
    private activatedRoute: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy), map((paramMap) => paramMap.get("mountId"))).subscribe((mountId) => {
      this.mountId = mountId;

      this.findMount();
      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.findIndices();
      })
    })
  }
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  private async findMount() {
    this._loadingSubject.next(true);
    this.mountService.findById(this.mountId).then((mount) => {
      this._mountSubject.next(mount);
    }).finally(() => {
      this._loadingSubject.next(false);
    })
  }

  public async findIndices() {
    const currentItemCount = this._indexSubject.getValue().length;
    if(currentItemCount != 0 && currentItemCount >= this.totalElements) return;
    
    this.indexService.findPage(this.mountId, { page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements;
      if(page.elements.length > 0) this.currentPage++;
      this._indexSubject.next([
        ...this._indexSubject.getValue(),
        ...page.elements
      ])
    })
  }

}
