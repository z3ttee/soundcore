import { Component, Input, OnInit } from '@angular/core';
import { Playlist, MeiliPlaylist } from '@soundcore/sdk';

@Component({
  selector: 'scngx-playlist-grid-item',
  templateUrl: './playlist-grid-item.component.html',
  styleUrls: ['./playlist-grid-item.component.scss']
})
export class SCDKPlaylistGridItemComponent implements OnInit {

  @Input() public item: Playlist | MeiliPlaylist;

  constructor() { }

  ngOnInit(): void {}

}
