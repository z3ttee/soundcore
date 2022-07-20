import { Component, Input, OnInit } from '@angular/core';
import { Song, MeiliSong } from 'soundcore-sdk';

@Component({
  selector: 'song-grid-item',
  templateUrl: './song-grid-item.component.html',
  styleUrls: ['./song-grid-item.component.scss']
})
export class SongGridItemComponent implements OnInit {

  @Input() public item: Song | MeiliSong;

  constructor() { }

  ngOnInit(): void {
  }

}
