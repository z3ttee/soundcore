import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Playlist } from '../../entities/playlist.entity';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'asc-choose-playlist',
  templateUrl: './choose-playlist.component.html',
  styleUrls: ['./choose-playlist.component.scss']
})
export class ChoosePlaylistComponent implements OnInit {

  public $playlists: Observable<Playlist[]> = this.playlistService.$playlists;

  constructor(
    private playlistService: PlaylistService,
    public dialogRef: MatDialogRef<ChoosePlaylistComponent>
  ) { }

  ngOnInit(): void {
  }

  public async choosePlaylist(playlist: Playlist) {
    this.dialogRef.close(playlist);
  }



}
