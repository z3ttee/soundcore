import { Component, Input, OnInit } from '@angular/core';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-playlist-list-item',
  templateUrl: './playlist-list-item.component.html',
  styleUrls: ['./playlist-list-item.component.scss']
})
export class PlaylistListItemComponent implements OnInit {

  @Input() public playlist: Playlist;
  @Input() public active: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";

  constructor() { }

  public ngOnInit(): void {
    if(this.playlist.artwork) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.playlist.artwork.id}`;
      this.accentColor = this.playlist.artwork.accentColor || "#000000";
    } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    }
  }

}
