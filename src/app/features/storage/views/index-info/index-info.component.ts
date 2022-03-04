import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Index } from 'src/app/features/upload/entities/index.entity';
import { IndexReport } from '../../entities/index-report.entity';
import { IndexService } from '../../services/index.service';

@Component({
  templateUrl: './index-info.component.html',
  styleUrls: ['./index-info.component.scss']
})
export class IndexInfoComponent implements OnInit, OnDestroy {

  // TODO: Make strat to OnPush

  constructor(
    private indexService: IndexService,
    private activatedRoute: ActivatedRoute
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  private indexId: string;

  private _indexSubject: BehaviorSubject<Index> = new BehaviorSubject(null);
  private _reportSubject: BehaviorSubject<IndexReport> = new BehaviorSubject(null);

  public $index: Observable<Index> = this._indexSubject.asObservable().pipe(takeUntil(this.$destroy));
  public $report: Observable<IndexReport> = this._reportSubject.asObservable().pipe(takeUntil(this.$destroy));
  
  // Loading states
  public isLoading: boolean = false;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.indexId = paramMap.get("indexId")
      this.findIndex();
      this.findReportByIndex();

      /*this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.findIndex()
      })*/
    })
  }
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async findIndex() {
    this.isLoading = true;
    this.indexService.findById(this.indexId).then((index) => {
      this._indexSubject.next(index);
    }).finally(() => this.isLoading = false)
  }

  public async findReportByIndex() {
    this.indexService.findReportByIndex(this.indexId).then((report) => {
      this._reportSubject.next(report);
    })
  }

}
