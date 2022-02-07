import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { CreatePlaylistDialog } from 'src/app/features/playlist/dialogs/create-playlist/create-playlist.component';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';

@Component({
  selector: 'asc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public $playlists: Observable<Playlist[]> = this.playlistService.$playlists;

  public error: HttpErrorResponse = undefined;

  constructor(
    private playlistService: PlaylistService,
    private dialog: MatDialog
  ) { }

  public async ngOnInit(): Promise<void> {}

  public async openCreatePlaylist() {
      this.dialog.open(CreatePlaylistDialog, {
        data: {},
      });
  }

}
