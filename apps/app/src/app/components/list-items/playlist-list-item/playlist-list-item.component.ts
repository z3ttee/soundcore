import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Playlist } from '@soundcore/sdk';

@Component({
  selector: 'scngx-playlist-list-item',
  templateUrl: './playlist-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXPlaylistListItemComponent implements OnInit {

  @Input() public playlist: Playlist;
  @Input() public itemSize: number = 36;

  constructor() { }

  ngOnInit(): void {
  }

}
