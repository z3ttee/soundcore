import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { DeviceService } from 'src/app/services/device.service';
import { LikeService } from 'src/app/services/like.service';
import { environment } from 'src/environments/environment';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'asc-stream-player-bar',
  templateUrl: './stream-player-bar.component.html',
  styleUrls: ['./stream-player-bar.component.scss']
})
export class StreamPlayerBarComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject();
  private $destroy = this._destroySubject.asObservable();

  public $artworkUrl: Observable<string> = this.audioService.$currentSong.pipe(
    map((song) => {
      if(song?.artwork) {
        return `${environment.api_base_uri}/v1/artworks/${song.artwork.id}`;
      }
      return "/assets/img/missing_cover.png"
    })
  )

  public $accentColor: Observable<string> = this.audioService.$currentSong.pipe(
    map((song) => {
      if(song?.artwork) {
        return song.artwork.accentColor;
      }
      return "#000000";
    })
  )

  public currentSrc: string = "";
  public currentSeekValue: number = 0;
  public currentTime: number = 0;
  
  public isLoading: boolean = false;
  public canPlay: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";

  private _song: Song = null;

  constructor(
    public audioService: AudioService,
    public likeService: LikeService,
    public deviceService: DeviceService
  ) {}

  public ngOnInit(): void {
    this.audioService.$currentSong.pipe(takeUntil(this.$destroy)).subscribe((song) => {
      this._song = song;
    })
  }

  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  public async onSeeking(data) {
    console.log(data)
    this.audioService.setCurrentTime(data)
  }

  public async likeSong() {
    this.likeService.likeSong(this._song);
  }

}
