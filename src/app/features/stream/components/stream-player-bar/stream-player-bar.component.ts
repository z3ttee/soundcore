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
  public isPaused: boolean = true;
  public currentSeekValue: number = 0;

  constructor(private streamService: StreamService) {
    this.$currentSong = this.streamService.$currentSong.pipe(tap((song) => {
      if(song) {
        this.currentSrc = `${environment.api_base_uri}/v1/streams/songs/${song.id}`;
      } else {
        this.currentSrc = ""
      }
    }));
  }

  ngOnInit(): void {
  }

  public onTimeUpdate(event: Event) {
    const val = event.target["currentTime"];
    console.log("new time: ", val);
    this.currentSeekValue = val;
  }

  public onPauseEvent() {
    this.isPaused = true
  }

  public onPlayEvent() {
    this.isPaused = false
  }

  public onEndedEvent() {
    // Start next song in queue
  }

  public pause() {
    this.audio.nativeElement.pause();
  }

  public play() {

    this.audio.nativeElement.play();
  }

  public next() {

  }

}
