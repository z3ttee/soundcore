import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'asc-stream-player-bar',
  templateUrl: './stream-player-bar.component.html',
  styleUrls: ['./stream-player-bar.component.scss']
})
export class StreamPlayerBarComponent implements OnInit {

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

  constructor(
    public audioService: AudioService
  ) {}

  public ngOnInit(): void {}

  public async onSeeking(data) {
    console.log(data)
    this.audioService.setCurrentTime(data)
  }

}
