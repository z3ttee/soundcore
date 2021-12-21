import { Component, OnInit } from '@angular/core';
import { map, Observable, of, take, tap } from 'rxjs';
import { Song } from 'src/app/model/song.model';
import { Page } from 'src/app/pagination/pagination';
import { SongService } from 'src/app/services/song.service';
import { StreamService } from 'src/app/services/stream.service';

@Component({
  selector: 'asc-releases-index',
  templateUrl: './releases-index.component.html',
  styleUrls: ['./releases-index.component.scss']
})
export class ReleasesIndexComponent implements OnInit {

  public $latestSongs: Observable<Page<Song>>;

  constructor(private songService: SongService, private streamService: StreamService) {
    this.$latestSongs = this.songService.findLatestSongs().pipe(map((page) => {
      page.elements = page.elements.slice(0, 8);
      return page
    }));
  }

  ngOnInit(): void {
    
    
  }

  public async selectSong(song: Song) {
    this.streamService.playSong(song)
  }

}
