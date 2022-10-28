import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { BehaviorSubject, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { Song } from '@soundcore/sdk';
import audio_wave_anim from "../../../assets/lottie/audio_wave.json";

export class SCNGXSongCol {
  public enabled: boolean = true;
  public collapseAt?: number = 0;
}

export class SCNGXSongColConfig {
  public id?: SCNGXSongCol = new SCNGXSongCol();
  public cover?: SCNGXSongCol = new SCNGXSongCol();
  public count?: SCNGXSongCol = new SCNGXSongCol();
  public album?: SCNGXSongCol = new SCNGXSongCol();
  public date?: SCNGXSongCol = new SCNGXSongCol();
  public duration?: SCNGXSongCol = new SCNGXSongCol();
}

@Component({
  selector: 'scngx-song-list-item',
  templateUrl: './song-list-item.component.html',
  styleUrls: ['./song-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXSongListItemComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private readonly screenService: SCCDKScreenService,
    private readonly elementRef: ElementRef,
    private readonly zone: NgZone
  ) { }

  private $destroy: Subject<void> = new Subject();
  private resizeObserver: ResizeObserver;

  @Input() public song: Song;
  @Input() public index: number;
  @Input() public isActive: boolean = false;
  @Input() public isPaused: boolean = false;

  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();

  @Output() public onContext: EventEmitter<Song> = new EventEmitter();
  @Output() public onPlay: EventEmitter<Song> = new EventEmitter();
  @Output() public onLike: EventEmitter<Song> = new EventEmitter();

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;

  private _hoverSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public $hovering: Observable<boolean> = this._hoverSubject.asObservable().pipe(takeUntil(this.$destroy));
  public $isTouch: Observable<boolean> = this.screenService.$isTouch.pipe(takeUntil(this.$destroy))

  public $showId: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $showCover: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $showCount: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $showAlbum: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $showDate: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $showDuration: BehaviorSubject<boolean> = new BehaviorSubject(true);

  // Lottie animations options
  public animOptions: AnimationOptions = {
    autoplay: true,
    loop: true,
    animationData: audio_wave_anim
  }

  public ngOnInit(): void {
    fromEvent(this.elementRef.nativeElement, "mouseenter").pipe(takeUntil(this.$destroy)).subscribe((event) => {
      this._hoverSubject.next(true);
    })

    fromEvent(this.elementRef.nativeElement, "mouseleave").pipe(takeUntil(this.$destroy)).subscribe((event) => {
      this._hoverSubject.next(false);
    })
    
    this.$showId.next(this.columns.id?.enabled);
    this.$showCover.next(this.columns.count?.enabled);
    this.$showCount.next(this.columns.count?.enabled);
    this.$showAlbum.next(this.columns.album?.enabled);
    this.$showDate.next(this.columns.date?.enabled);
    this.$showDuration.next(this.columns.duration?.enabled);
  }

  public ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver((entries, observer) => {
      this.zone.run(() => this.onResize(entries, observer))
    })

    this.resizeObserver.observe(this.containerRef.nativeElement, { box: "border-box" })
  }

  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();

      this.onContext.complete();
      this.onPlay.complete();

      this.resizeObserver.disconnect();
      this.resizeObserver = null;
  }

  private onResize(entries: ResizeObserverEntry[], observer: ResizeObserver) {
    const containerWidth = this.containerRef.nativeElement.getBoundingClientRect().width;

    for(const entry of entries) {
      this.$showId.next((this.columns.id?.collapseAt || 0) < containerWidth && this.columns.id?.enabled)
      this.$showCover.next((this.columns.cover?.collapseAt || 0) < containerWidth && this.columns.cover?.enabled)
      this.$showCount.next((this.columns.count?.collapseAt || 0) < containerWidth && this.columns.count?.enabled)
      this.$showAlbum.next((this.columns.album?.collapseAt || 0) < containerWidth && this.columns.album?.enabled)
      this.$showDate.next((this.columns.date?.collapseAt || 0) < containerWidth && this.columns.date?.enabled)
      this.$showDuration.next((this.columns.duration?.collapseAt || 0) < containerWidth && this.columns.duration?.enabled)
    }
  }

  public emitOnContext(event: MouseEvent) {
    if(this.onContext.observed) {
      this.cancelEvent(event);
    }

    this.onContext.emit(this.song);
  }

  public emitOnPlay(event: MouseEvent) {
    if(this.onPlay.observed) {
      this.cancelEvent(event);
    }

    this.onPlay.emit(this.song);
  }

  public emitOnLike(event: MouseEvent) {
    if(this.onLike.observed) {
      this.cancelEvent(event);
    }
    
    this.onLike.emit(this.song);
  }

  private cancelEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

}
