import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { SongService } from 'src/app/features/song/services/song.service';
import { StreamService } from 'src/app/features/stream/services/stream.service';
import { Page } from 'src/app/pagination/pagination';

@Component({
  selector: 'asc-releases-index',
  templateUrl: './releases-index.component.html',
  styleUrls: ['./releases-index.component.scss']
})
export class ReleasesIndexComponent implements OnInit {

  public $latestSongs: Observable<Page<Song>>;

  constructor(private songService: SongService, private streamService: StreamService) {
    this.$latestSongs = this.songService.findLatestSongs();
  }

  ngOnInit(): void {
    
    
  }

  public async selectSong(song: Song) {
    this.streamService.playSong(song)
  }

}
