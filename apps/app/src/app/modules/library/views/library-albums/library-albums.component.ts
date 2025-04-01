import { Component, OnInit } from '@angular/core';
import { SCDKAlbumService } from '@repo/angular-sdk';

@Component({
    selector: 'app-library-albums',
    templateUrl: './library-albums.component.html',
    styleUrls: ['./library-albums.component.scss'],
    standalone: false
})
export class LibraryAlbumsComponent implements OnInit {

  constructor(
    public readonly albumService: SCDKAlbumService
  ) { }

  ngOnInit(): void {
  }

}
