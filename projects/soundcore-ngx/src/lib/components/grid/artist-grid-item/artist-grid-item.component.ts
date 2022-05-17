import { Component, Input, OnInit } from '@angular/core';
import { Album, Artist } from 'soundcore-sdk';

@Component({
  selector: 'scngx-artist-grid-item',
  templateUrl: './artist-grid-item.component.html',
  styleUrls: ['./artist-grid-item.component.scss']
})
export class SCNGXArtistGridItemComponent implements OnInit {

  /**
   * Artist data
   */
  @Input() public item: Artist;

  constructor() { }

  ngOnInit(): void {
  }

}
