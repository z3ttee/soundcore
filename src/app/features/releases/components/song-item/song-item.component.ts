import { Component, Input, OnInit } from '@angular/core';
import { Song } from 'src/app/model/song.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-song-item',
  templateUrl: './song-item.component.html',
  styleUrls: ['./song-item.component.scss']
})
export class SongItemComponent implements OnInit {
  
  @Input() public song: Song;

  public coverSrc: string = null;

  ngOnInit(): void {
    if(this.song.artwork) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.song.artwork?.id}`;
    } else {
      // TODO: Set default artwork
    }
  }

}
