import { Component, Input, OnInit } from '@angular/core';
import { Album, MeiliAlbum } from '@repo/angular-sdk';

@Component({
    selector: 'scngx-album-grid-item',
    templateUrl: './album-grid-item.component.html',
    styleUrls: ['./album-grid-item.component.scss'],
    standalone: false
})
export class SCNGXAlbumGridItemComponent implements OnInit {

  /**
   * Album data
   */
  @Input() public item: Album | MeiliAlbum;

  /**
   * Show release date instead of primary artist's name.
   */
  @Input() public useDate: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
