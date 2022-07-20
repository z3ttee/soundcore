import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService } from 'soundcore-ngx';
import { MeiliSong, Playlist, SCDKPlaylistService, Song } from 'soundcore-sdk';
import { SCCDKContextService } from "soundcore-cdk";
import { AppPlaylistChooseDialog } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.component';

@Component({
  selector: 'app-song-context-menu',
  templateUrl: './song-context-menu.component.html',
  styleUrls: ['./song-context-menu.component.scss']
})
export class SongContextMenuComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();

  @Input() public song: Song | MeiliSong;

  constructor(
    private readonly dialog: SCNGXDialogService,
    private readonly playlistService: SCDKPlaylistService,
    private readonly snackbar: MatSnackBar,
    private readonly contextService: SCCDKContextService
  ) { }

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public openChoosePlaylistDialog() {
    this.contextService.close();
    this.dialog.open<any, any, Playlist>(AppPlaylistChooseDialog).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((result) => {
      if(!result) return;
      this.addSongToPlaylist(result);
    });
  }

  private addSongToPlaylist(playlist: Playlist) {
    this.playlistService.addSongs(playlist.id, [{ id: this.song.id } as Song]).pipe(takeUntil(this._destroy)).subscribe((response) => {
      if(response.error) {
        this.snackbar.open("Song konnte nicht zur Playlist hinzugefügt werden");
        console.log(response.error)
        return;
      }
    });
  }

}
