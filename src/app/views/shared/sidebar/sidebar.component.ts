import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
  ) { }

  public async ngOnInit(): Promise<void> {}

  public async openCreatePlaylist() {
    this.playlistService.openEditorDialog({ mode: "create" })
  }

}
