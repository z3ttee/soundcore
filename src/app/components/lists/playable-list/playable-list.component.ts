import { AfterViewInit, ChangeDetectionStrategy, Component, ComponentRef, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import audio_wave_anim from "src/assets/animated/audio_wave.json"
import { ScrollService } from 'src/app/services/scroll.service';
import { BehaviorSubject, combineLatest, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { LikeService } from 'src/app/services/like.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { SongContextMenuComponent } from '../../context-menus/song-context-menu/song-context-menu.component';

@Component({
  selector: 'asc-playable-list',
  templateUrl: './playable-list.component.html',
  styleUrls: ['./playable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayableListComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private scrollService: ScrollService,
    public audioService: AudioService,
    private likeService: LikeService,
    private zone: NgZone
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  private _listSubject: BehaviorSubject<PlayableList<any>> = new BehaviorSubject(null);
  private _showCoverSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showAlbumSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showDateSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showCountSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showIdSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);

  public $list: Observable<PlayableList<any>> = this._listSubject.asObservable();
  public $showCover: Observable<boolean> = this._showCoverSubject.asObservable();
  public $showAlbum: Observable<boolean> = this._showAlbumSubject.asObservable();
  public $showDate: Observable<boolean> = this._showDateSubject.asObservable();
  public $showCount: Observable<boolean> = this._showCountSubject.asObservable();
  public $showId: Observable<boolean> = this._showIdSubject.asObservable();

  private _showId: boolean = true;
  private _showCover: boolean = true;
  private _showAlbum: boolean = true;
  private _showDate: boolean = true;
  private _showCount: boolean = true;

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;
  @ViewChild("songMenu") public contextMenuRef: SongContextMenuComponent;


  @Input() public set list(val: PlayableList<any>) {
    this._listSubject.next(val);
  }
  @Input() public set showCover(val: boolean) {
    if(typeof val == "undefined" || val == null) val = true;
    this._showCover = val;
    this._showCoverSubject.next(val || false);
  }
  @Input() public set showAlbum(val: boolean) {
    if(typeof val == "undefined" || val == null) val = true;
    this._showAlbum = val;
    this._showAlbumSubject.next(val);
  }
  @Input() public set showDate(val: boolean) {
    if(typeof val == "undefined" || val == null) val = true;
    this._showDate = val;
    this._showDateSubject.next(val || false);
  }
  @Input() public set showCount(val: boolean) {
    if(typeof val == "undefined" || val == null) val = true;
    this._showCount = val;
    console.log("show count: ", this._showCount)
    this._showCountSubject.next(val || false);
  }

  // ResizeObserver
  private resizeObserver: ResizeObserver;

  public animOptions: AnimationOptions = {
    autoplay: true,
    loop: true,
    animationData: audio_wave_anim
  }

  public ngOnInit(): void {
    this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.fetchNextPage();
    })

    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy)).subscribe((song) => {
      
    })
  }

  public ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.zone.run(() => {
        for(const entry of entries) {
          const width = entry.borderBoxSize[0].inlineSize

          console.log(width >= 850)
          console.log(this._showCount && width >= 850)

          this._showCountSubject.next(this._showCount && width >= 850)
          this._showDateSubject.next(this._showDate && width >= 700)
          this._showAlbumSubject.next(this._showAlbum && width >= 550)
          // this._.next(width >= 500
          this._showIdSubject.next(this._showId && width >= 500)
        }
      })
    })
    const container = this.containerRef.nativeElement;
    this.resizeObserver.observe(container)
  }

  public ngOnDestroy(): void {
      const container = this.containerRef.nativeElement;
      this.resizeObserver.unobserve(container)

      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async onContainerResize(entries: ResizeObserverEntry[]) {
    
  }

  public async playOrPause(song: Song) {
    this.audioService.playOrPause(song);
  }

  public async fetchNextPage() {
    this.$list.pipe(take(1)).subscribe((list) => {
      list.fetchNextPage();
    })
  }

  public async openContextMenu(event: MouseEvent, song: Song) {
    if(!this.contextMenuRef) return;

    this.$list.pipe(take(1)).subscribe((list) => {
      this.contextMenuRef.open(event, song, list.context)
    })
  }

}
