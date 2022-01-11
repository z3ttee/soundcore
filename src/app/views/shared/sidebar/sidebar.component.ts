import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreatePlaylistDialog } from 'src/app/features/playlist/dialogs/create-playlist/create-playlist.component';
import { CreatePlaylistDTO } from 'src/app/features/playlist/dtos/create-playlist.dto';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { Page } from 'src/app/pagination/pagination';

@Component({
  selector: 'asc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  private _playlistsSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);
  public $playlists: Observable<Playlist[]> = this._playlistsSubject.asObservable();

  public error: HttpErrorResponse = undefined;

  constructor(
    private playlistService: PlaylistService,
    private dialog: MatDialog
  ) { }

  public async ngOnInit(): Promise<void> {
    this.playlistService.findPageByAuthor().then((page) => {
      this._playlistsSubject.next(page.elements);
    }).catch((error: HttpErrorResponse) => {
      this.error = error
    })
  }

  public async openCreatePlaylist() {
      const dialogRef = this.dialog.open(CreatePlaylistDialog, {
        data: {},
      });
  
      dialogRef.afterClosed().subscribe((result: Playlist) => {
        if(!result) return;
        
        const playlists = this._playlistsSubject.getValue()
        playlists.push(result)
        this._playlistsSubject.next(playlists)
      });
  }

}
