import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';

@Component({
  templateUrl: './choose-playlist-dialog.component.html',
  styleUrls: ['./choose-playlist-dialog.component.scss']
})
export class AscChoosePlaylistDialogComponent implements OnInit {

  public $playlists: Observable<Playlist[]> = this.playlistService.$playlists;

  constructor(
    private playlistService: PlaylistService,
    public dialogRef: MatDialogRef<AscChoosePlaylistDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  public async choosePlaylist(playlist: Playlist) {
    this.dialogRef.close(playlist);
  }

}
