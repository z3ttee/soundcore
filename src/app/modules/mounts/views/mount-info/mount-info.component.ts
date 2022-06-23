import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { InfiniteDataSource } from 'soundcore-ngx';
import { File, Mount, SCDKFileService, SCDKMountService } from 'soundcore-sdk';

@Component({
  selector: 'app-mount-info',
  templateUrl: './mount-info.component.html',
  styleUrls: ['./mount-info.component.scss']
})
export class MountInfoComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private readonly mountService: SCDKMountService,
    private readonly fileService: SCDKFileService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly httpClient: HttpClient
  ) { }

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;
  
  private readonly _destroy: Subject<void> = new Subject();
  private readonly _mountSubject: BehaviorSubject<Mount> = new BehaviorSubject(null);
  private _more: Subject<IPageInfo> = new Subject();

  public readonly $loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $mount: Observable<Mount> = this._mountSubject.asObservable();

  public infiniteFetchUrl: string = "";
  public readonly infinitePageSize: number = 30;
  public dataSource: InfiniteDataSource<File>;

  public items: number[] = Array.from({length: 1000}).map((_, i) => i);

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((params) => {
      const mountId = params.get("mountId");

      // Reset and set state
      // to loading.
      this._mountSubject.next(null);
      this.$loading.next(true);

      // Set infinite list fetchUrl
      this.infiniteFetchUrl = this.fileService.findByMountIdBaseURL(mountId);

      this.dataSource = new InfiniteDataSource(this.httpClient, {
        pageSize: this.infinitePageSize,
        url: this.infiniteFetchUrl
      });

      this.dataSource?.connect(this._more.asObservable());

      // Find mount and update state
      this.mountService.findById(mountId).pipe(takeUntil(this._destroy)).subscribe((mount) => {
        this.$loading.next(false);
        this._mountSubject.next(mount);
      });
    })
  }

  public ngAfterViewInit(): void {
    const element = this.containerRef?.nativeElement;
    if(!element) return;
    
    const observer = new IntersectionObserver((entries) => {
      console.log(entries)
    },{
      root: document
    })

    observer.observe(element);
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public vsEnd(info: IPageInfo) {
    this._more.next(info);
  }

}
