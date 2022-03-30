import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import audio_wave_anim from "src/assets/animated/audio_wave.json"
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { LikeService } from 'src/app/services/like.service';
import { SongContextMenuComponent } from '../../context-menus/song-context-menu/song-context-menu.component';
import { PlayableList } from 'src/lib/data/playable-list.entity';

@Component({
  selector: 'asc-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AscSongListComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    public audioService: AudioService,
    private likeService: LikeService,
    private zone: NgZone
  ) { }

  @Input() public dataSource: Observable<Song[]>;

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  private _showCoverSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showAlbumSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showDateSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showCountSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showHeaderSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _showIdSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _listSubject: BehaviorSubject<PlayableList<any>> = new BehaviorSubject(null);

  public $showHeader: Observable<boolean> = this._showHeaderSubject.asObservable();
  public $showCover: Observable<boolean> = this._showCoverSubject.asObservable();
  public $showAlbum: Observable<boolean> = this._showAlbumSubject.asObservable();
  public $showDate: Observable<boolean> = this._showDateSubject.asObservable();
  public $showCount: Observable<boolean> = this._showCountSubject.asObservable();
  public $showId: Observable<boolean> = this._showIdSubject.asObservable();
  public $list: Observable<PlayableList<any>> = this._listSubject.asObservable();

  private _showId: boolean = true;
  private _showHeader: boolean = true;
  private _showCover: boolean = true; // TODO
  private _showAlbum: boolean = true;
  private _showDate: boolean = true;
  private _showCount: boolean = true;

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;
  @ViewChild("songMenu") public contextMenuRef: SongContextMenuComponent;

  @Input() public set list(val: PlayableList<any>) {
    this._listSubject.next(val);
    this.initView()
  }
  @Input() public set showHeader(val: boolean) {
    if(typeof val == "undefined" || val == null) val = true;
    this._showHeader = val;
    this._showHeaderSubject.next(val || false);
  }
  @Input() public set showId(val: boolean) {
    if(typeof val == "undefined" || val == null) val = true;
    this._showId = val;
    this._showIdSubject.next(val || false);
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
    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy)).subscribe((song) => {
      // TODO
    })
  }

  public ngAfterViewInit(): void {
    this.initView()
  }

  public ngOnDestroy(): void {
      const container = this.containerRef.nativeElement;
      this.resizeObserver.unobserve(container)

      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public initView() {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.zone.run(() => {
        for(const entry of entries) {
          const width = entry.borderBoxSize[0].inlineSize

          this._showCountSubject.next(this._showCount && width >= 850)
          this._showDateSubject.next(this._showDate && width >= 700)
          this._showAlbumSubject.next(this._showAlbum && width >= 550)
          this._showIdSubject.next(this._showId && width >= 500)
        }
      })
    })
    const container = this.containerRef?.nativeElement;
    if(container) this.resizeObserver.observe(container);
  }

  public async playOrPause(song: Song) {
    this.audioService.playOrPause(song);
  }

  public async openContextMenu(event: MouseEvent, song: Song) {
    if(!this.contextMenuRef) return;

    this.$list.pipe(take(1)).subscribe((list) => {
      this.contextMenuRef.open(event, song, list?.context)
    })
  }

}
