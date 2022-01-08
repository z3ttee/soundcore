import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { StreamService } from 'src/app/features/stream/services/stream.service';
import { environment } from 'src/environments/environment';
import { Song } from '../../entities/song.entity';

@Component({
  selector: 'asc-song-item',
  templateUrl: './song-item.component.html',
  styleUrls: ['./song-item.component.scss']
})
export class SongItemComponent implements OnInit {

  @Input() public song: Song;
  @Input() public playable: boolean = true;

  public coverSrc: string = null;
  public accentColor: string = "";
  public $isPlaying: Observable<boolean>;

  constructor(private streamService: StreamService) {
    this.$isPlaying = this.streamService.$currentSong.pipe(map((song) => song?.id == this.song.id));
  }

  public async ngOnInit() {
    if(this.song.artwork) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.song.artwork.id}`;
      this.accentColor = this.song.artwork.accentColor || "#000000";
    } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    }
  }

  public async playOrPause() {
    if(!this.playable) return;
    this.streamService.playSong(this.song);
  }

}
