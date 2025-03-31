import { Component, Input, OnInit } from '@angular/core';
import { MeiliSong, Song } from '@repo/angular-sdk';

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
