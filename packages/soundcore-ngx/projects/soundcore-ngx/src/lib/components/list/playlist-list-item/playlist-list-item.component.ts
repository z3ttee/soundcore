import { Component, Input, OnInit } from '@angular/core';
import { Playlist } from '@soundcore/sdk';

@Component({
  selector: 'scngx-playlist-list-item',
  templateUrl: './playlist-list-item.component.html',
  styleUrls: ['./playlist-list-item.component.scss']
})
export class SCNGXPlaylistListItemComponent implements OnInit {

  @Input() public playlist: Playlist;

  constructor() { }

  ngOnInit(): void {
  }

}
