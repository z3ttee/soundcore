import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService } from 'soundcore-ngx';
import { MeiliSong, Playlist, Song } from 'soundcore-sdk';
import { AppPlaylistChooseDialog } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.component';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  selector: 'app-song-context-menu',
  templateUrl: './song-context-menu.component.html',
  styleUrls: ['./song-context-menu.component.scss']
})
export class SongContextMenuComponent implements OnInit, OnDestroy {

  @Input() public song: Song | MeiliSong

  constructor(
    private readonly authService: AuthenticationService,
    private readonly dialog: SCNGXDialogService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  public readonly $isAdmin: Observable<boolean> = this.authService.$isAdmin.pipe(takeUntil(this._destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  public openChoosePlaylistDialog() {
    this.dialog.open<any, any, Playlist>(AppPlaylistChooseDialog).$afterClosed.subscribe((playlist) => {
      const song = this.song;

      console.log("add song ", song, "to playlist", playlist);
    })
  }

}
