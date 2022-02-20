import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { LikeService } from 'src/app/services/like.service';
import { Song } from '../../entities/song.entity';

@Component({
  selector: 'asc-song-info',
  templateUrl: './song-info.component.html',
  styleUrls: ['./song-info.component.scss']
})
export class SongInfoComponent implements OnInit, OnDestroy {

  private _songSubject: BehaviorSubject<Song> = new BehaviorSubject(null);
  public $song: Observable<Song> = this._songSubject.asObservable();

  constructor(
    public audioService: AudioService,
    private likeService: LikeService
  ) { }

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._songSubject.complete();
  }

  public likeSong() {
    const song = this._songSubject.getValue();
    this.likeService.likeSong(song).then((isLiked) => {
      song.isLiked = isLiked;
      this._songSubject.next(song);
    });
  }

  public playOrPause() {
    const song = this._songSubject.getValue();
    this.audioService.playOrPause(song);
  }

}
