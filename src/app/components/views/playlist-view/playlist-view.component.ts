import { Component, Input, OnInit } from '@angular/core';
import { PlaylistPrivacy } from 'src/app/features/playlist/types/playlist-privacy.types';
import { Artwork } from 'src/app/model/artwork.model';

export type PlaylistViewType = "playlist" | "song" | "artist" | "collection" | "album" | "user";
export interface PlaylistViewOptions {
  type?: PlaylistViewType;
  privacy?: PlaylistPrivacy;
  title?: string;
  artwork?: Artwork;
  color?: string;
}

@Component({
  selector: 'asc-playlist-view',
  templateUrl: './playlist-view.component.html',
  styleUrls: ['./playlist-view.component.scss']
})
export class PlaylistViewComponent implements OnInit {

  // Default colors  
  public accentColor: string = "#FFBF50";
  public colorWhite: string = "#DDDDDD";

  @Input() public mode: "default" | "titleOnly" | "reduced" = "default"
  @Input() public options: PlaylistViewOptions = {
    type: "playlist",
    privacy: "public",
    title: "Unknown title",
    artwork: undefined,
    color: this.colorWhite
  };

  constructor() { }

  ngOnInit(): void {
    if(this.mode == "titleOnly") this.accentColor = this.colorWhite
  }

}
