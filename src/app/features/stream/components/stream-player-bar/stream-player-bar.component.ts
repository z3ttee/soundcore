import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { environment } from 'src/environments/environment';
import { AudioService } from '../../services/audio.service';
import { StreamService } from '../../services/stream.service';

@Component({
  selector: 'asc-stream-player-bar',
  templateUrl: './stream-player-bar.component.html',
  styleUrls: ['./stream-player-bar.component.scss']
})
export class StreamPlayerBarComponent implements OnInit {

  public currentSong: Song;

  public $currentSong: Observable<Song> = this.audioService.$currentSong;
  public $paused: Observable<boolean> = this.audioService.$paused;

  public currentSrc: string = "";
  public currentSeekValue: number = 0;
  public currentTime: number = 0;
  
  public isLoading: boolean = false;
  public canPlay: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";

  constructor(
    private audioService: AudioService
  ) {
    this.audioService.$currentSong.subscribe((song) => {
      
      /*// Check if same song is selected again, prevent further
      // processing.
      if(song && this.currentSong?.id == song.id) return;

      // Reset the player's values
      this.currentSong = song;
      this.currentTime = 0;
      this.currentSeekValue = 0;

      if(!song) {
        // Clear audio src if no song was selected or song is null in general
        this.currentSrc = ""
        return
      }
      
      // Set audio src url
      this.currentSrc = `${environment.api_base_uri}/v1/streams/songs/${song.id}`;

      if(song.artwork) {
        // Set artwork url and accentColor if an artwork exists on song
        this.coverSrc = `${environment.api_base_uri}/v1/artworks/${song.artwork.id}`;
        this.accentColor = song.artwork.accentColor || "#000000";
      } else {
        // Set default artwork image
        this.coverSrc = "/assets/img/missing_cover.png"
      }*/
    });
  }

  public ngOnInit(): void {}

  public async onSeeking(data) {
    console.log(data)
  }

}
