import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { StreamService } from 'src/app/features/stream/services/stream.service';
import { Artist } from 'src/app/model/artist.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-artist-grid-item',
  templateUrl: './artist-grid-item.component.html',
  styleUrls: ['./artist-grid-item.component.scss']
})
export class ArtistGridItemComponent implements OnInit {

  @Input() public artist: Artist;
  @Input() public playable: boolean = true;

  public coverSrc: string = null;
  public accentColor: string = "";
  public $isPlaying: Observable<boolean>;

  constructor(private streamService: StreamService) {
    this.$isPlaying = this.streamService.$currentSong.pipe(map((song) => !!song?.artists.find((artist) => artist.id == this.artist.id)));
  }

  public async ngOnInit() {
    if(this.artist.artwork) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.artist.artwork.id}`;
      this.accentColor = this.artist.artwork.accentColor || "#000000";
    } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    }
  }

  public async playOrPause() {
    if(!this.playable) return;
    this.streamService.playArtist(this.artist);
  }

}
