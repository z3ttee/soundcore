import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { StreamService } from 'src/app/features/stream/services/stream.service';
import { Album } from 'src/app/model/album.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-album-grid-item',
  templateUrl: './album-grid-item.component.html',
  styleUrls: ['./album-grid-item.component.scss']
})
export class AlbumGridItemComponent implements OnInit {

  @Input() public album: Album;
  @Input() public playable: boolean = true;

  public coverSrc: string = null;
  public accentColor: string = "";
  public $isPlaying: Observable<boolean>;

  constructor(private streamService: StreamService) {
    this.$isPlaying = this.streamService.$currentSong.pipe(map((song) => !!song?.albums?.find((album) => album.id == this.album.id)));
  }

  public async ngOnInit() {
    if(this.album.artwork) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.album.artwork.id}`;
      this.accentColor = this.album.artwork.accentColor || "#000000";
    } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    }
  }

  public async playOrPause() {
    if(!this.playable) return;
    this.streamService.playAlbum(this.album);
  }

}
