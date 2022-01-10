import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { environment } from 'src/environments/environment';
import { StreamService } from '../../services/stream.service';

@Component({
  selector: 'asc-stream-player-bar',
  templateUrl: './stream-player-bar.component.html',
  styleUrls: ['./stream-player-bar.component.scss']
})
export class StreamPlayerBarComponent implements OnInit {

  public $currentSong: Observable<Song>;

  @ViewChild("audio") private audio: ElementRef<HTMLAudioElement>;

  public currentSrc: string = "";
  public currentSeekValue: number = 0;
  public currentTime: number = 0;

  public isPaused: boolean = true;
  public isLoading: boolean = false;
  public canPlay: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";

  constructor(private streamService: StreamService) {
    this.$currentSong = this.streamService.$currentSong.pipe(tap((song) => {
      this.currentTime = 0;
      this.currentSeekValue = 0;

      if(song) {
        this.currentSrc = `${environment.api_base_uri}/v1/streams/songs/${song.id}`;

        if(song.artwork) {
          this.coverSrc = `${environment.api_base_uri}/v1/artworks/${song.artwork.id}`;
          this.accentColor = song.artwork.accentColor || "#000000";
        } else {
          this.coverSrc = "/assets/img/missing_cover.png"
        }
      } else {
        this.currentSrc = ""
      }
    }));
  }

  ngOnInit(): void {
  }

  public onTimeUpdated() {
    this.currentTime = this.audio.nativeElement.currentTime;
    this.currentSeekValue = this.currentTime
  }

  public hasPlayableSrc(): boolean {
    return this.currentSrc && this.currentSrc != ""
  }

  /**
   * Handle event that is fired if the browser starts loading the current 
   */
  public onLoadedData() {
    this.isLoading = false;
  }

  public onWaiting() {
    this.isLoading = true;
  }

  public onLoadStart() {
    if(!this.hasPlayableSrc()) {
      this.isLoading = false;
      this.isPaused = true;
      this.canPlay = false;
      return;
    }

    this.isLoading = true;
  }

  public onCanPlay() {
    this.canPlay = true;
    this.isLoading = false;
  }

  public onError() {
    this.canPlay = false;
    this.isLoading = false;
    this.isPaused = true;

    // TODO: Show error message
  }


  /**
   * Handle the seeking event, that is thrown by seek component
   */
  public onSeeking(seekVal: number) {
    if(!this.hasPlayableSrc()) {
      this.currentSeekValue = 0;  
      this.currentTime = 0;
      return;
    }

    this.currentSeekValue = seekVal;
    this.currentTime = seekVal;
    this.audio.nativeElement.currentTime = seekVal;
  }

  /**
   * Handle the seeking event, that is thrown by audio html element.
   * This is used to project changes in seeking onto the seek
   * slider component.
   */
  public onElementSeekEvent() {
    this.currentSeekValue = this.audio.nativeElement.currentTime
  }

  /**
   * Handle the pause event, that is thrown by audio html element.
   * This will cause switching the play buttons
   */
  public onPauseEvent() {
    this.isPaused = true
  }

  /**
   * Handle the play event, that is thrown by audio html element.
   * This will cause switching the play buttons
   */
  public onPlayEvent() {
    this.isPaused = false;
    this.isLoading = false;
  }

  /**
   * Audio element finished playing song.
   */
  public onEndedEvent() {
    // TODO: Start next song in queue
  }

  /**
   * Pause audio of the audio element
   */
  public pause() {
    this.audio.nativeElement.pause();
  }

  /**
   * Play audio of the audio element
   */
  public play() {
    if(this.hasPlayableSrc()) {
      this.audio.nativeElement.play();
    }
  }

  public next() {

  }

}
