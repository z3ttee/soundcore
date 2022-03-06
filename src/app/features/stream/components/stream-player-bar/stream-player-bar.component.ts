import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { DeviceService } from 'src/app/services/device.service';
import { LikeService } from 'src/app/services/like.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'asc-stream-player-bar',
  templateUrl: './stream-player-bar.component.html',
  styleUrls: ['./stream-player-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamPlayerBarComponent implements OnInit, OnDestroy {

  constructor(
    public audioService: AudioService,
    public likeService: LikeService,
    public deviceService: DeviceService
  ) {}

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy = this._destroySubject.asObservable();

  // Data providers
  private _songSubject: BehaviorSubject<Song> = new BehaviorSubject(null);

  public $song: Observable<Song> = this._songSubject.asObservable();

  public ngOnInit(): void {
    this.audioService.$currentItem.pipe(takeUntil(this.$destroy), map((item) => item?.song)).subscribe((song) => {
      this._songSubject.next(song);
    })

    // Listen for like event
    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy)).subscribe((item) => {
      const song = this._songSubject.getValue();
      song.liked = item.liked;
      this._songSubject.next(song);
    })
  }

  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  public async onSeeking(data) {
    this.audioService.setCurrentTime(data)
  }

  public async likeSong() {
    this.$song.pipe(take(1)).subscribe((song) => {
      this.likeService.likeSong(song);
    })
  }

}
