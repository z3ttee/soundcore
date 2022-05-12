import { Component, Input, OnInit } from '@angular/core';
import { Album } from 'soundcore-sdk';

@Component({
  selector: 'scngx-album-grid-item',
  templateUrl: './album-grid-item.component.html',
  styleUrls: ['./album-grid-item.component.scss']
})
export class SCNGXAlbumGridItemComponent implements OnInit {

  /**
   * Album data
   */
  @Input() public item: Album;

  /**
   * Show release date instead of primary artist's name.
   */
  @Input() public useDate: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
