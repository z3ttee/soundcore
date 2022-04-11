import { Component, OnInit } from '@angular/core';
import { SCDKPlaylistService } from 'soundcore-sdk';

@Component({
  selector: 'app-library-playlists',
  templateUrl: './library-playlists.component.html',
  styleUrls: ['./library-playlists.component.scss']
})
export class LibraryPlaylistsComponent implements OnInit {

  constructor(
    public readonly playlistService: SCDKPlaylistService
  ) { }

  ngOnInit(): void {
  }

}
