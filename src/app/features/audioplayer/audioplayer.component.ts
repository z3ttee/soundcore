import { Component, OnInit } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Song } from 'src/app/model/song.model';
import { StreamService } from 'src/app/services/stream.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-audioplayer',
  templateUrl: './audioplayer.component.html',
  styleUrls: ['./audioplayer.component.scss']
})
export class AudioplayerComponent implements OnInit {

  public $currentSong: Observable<Song>;
  public currentSrc: string = "";

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

}
