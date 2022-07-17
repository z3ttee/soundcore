import { Component, Input, OnInit } from '@angular/core';
import { Song, MeiliSong } from 'soundcore-sdk';

@Component({
  selector: 'scngx-song-grid-item',
  templateUrl: './song-grid-item.component.html',
  styleUrls: ['./song-grid-item.component.scss']
})
export class SCDKSongGridItemComponent implements OnInit {

  @Input() public item: Song | MeiliSong;

  constructor() { }

  ngOnInit(): void {
  }

}
