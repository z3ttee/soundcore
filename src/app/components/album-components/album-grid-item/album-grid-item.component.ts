import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Album } from 'src/app/features/album/entities/album.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-album-grid-item',
  templateUrl: './album-grid-item.component.html',
  styleUrls: ['./album-grid-item.component.scss']
})
export class AlbumGridItemComponent implements OnInit {

  @Input() public album: Album;
  @Input() public playable: boolean = true;
  @Input() public preferDate: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";
  public $isPlaying: Observable<boolean>;

  constructor(private audioService: AudioService) {
    this.$isPlaying = this.audioService.$currentSong.pipe(map((song) => !!song?.albums?.find((album) => album.id == this.album.id)));
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
    // TODO: this.audioService.playAlbum(this.album);
  }

}
