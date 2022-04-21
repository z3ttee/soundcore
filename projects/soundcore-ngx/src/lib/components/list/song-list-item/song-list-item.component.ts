import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { BehaviorSubject, combineLatest, fromEvent, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Song } from 'soundcore-sdk';
import audio_wave_anim from "../../../assets/lottie/audio_wave.json"
import { SCNGXScreenService } from '../../../services/screen/screen.service';

@Component({
  selector: 'scngx-song-list-item',
  templateUrl: './song-list-item.component.html',
  styleUrls: ['./song-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXSongListItemComponent implements OnInit, OnDestroy {

  constructor(
    private readonly screenService: SCNGXScreenService,
    private readonly elementRef: ElementRef
  ) { }

  private _destroy: Subject<void> = new Subject();

  @Input() public song: Song;
  @Input() public index: number;
  @Input() public isActive: boolean = false;
  @Input() public isPaused: boolean = false;

  @Input() public showId: boolean = true;
  @Input() public showCover: boolean = true;
  @Input() public showCount: boolean = true;
  @Input() public showAlbum: boolean = true;
  @Input() public showDate: boolean = true;

  @Output() public onContext: EventEmitter<Song> = new EventEmitter();
  @Output() public onPlay: EventEmitter<Song> = new EventEmitter();
  @Output() public onLike: EventEmitter<Song> = new EventEmitter();

  private _hoverSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public $hovering: Observable<boolean> = this._hoverSubject.asObservable().pipe(takeUntil(this._destroy));

  // Lottie animations options
  public animOptions: AnimationOptions = {
    autoplay: true,
    loop: true,
    animationData: audio_wave_anim
  }

  public ngOnInit(): void {
    fromEvent(this.elementRef.nativeElement, "mouseenter").pipe(takeUntil(this._destroy)).subscribe((event) => {
      this._hoverSubject.next(true);
    })

    fromEvent(this.elementRef.nativeElement, "mouseleave").pipe(takeUntil(this._destroy)).subscribe((event) => {
      this._hoverSubject.next(false);
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();

      this.onContext.complete();
      this.onPlay.complete();
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
