import { DataSource } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { Song } from 'soundcore-sdk';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';

@Component({
  selector: 'scngx-virtual-song-list',
  templateUrl: './virtual-song-list.component.html',
  styleUrls: ['./virtual-song-list.component.scss']
})
export class SCNGXVirtualSongListComponent implements OnInit {

  @Input() public dataSource: DataSource<Song>
  @Input() public usePadding: boolean = true;
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();

  constructor() { }

  public ngOnInit(): void {}
  public emitOnContext() {

  }

}
