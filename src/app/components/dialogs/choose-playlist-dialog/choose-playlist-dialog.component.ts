import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  templateUrl: './choose-playlist-dialog.component.html',
  styleUrls: ['./choose-playlist-dialog.component.scss']
})
export class AscChoosePlaylistDialogComponent implements OnInit, OnDestroy {

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthenticationService,
    public dialogRef: MatDialogRef<AscChoosePlaylistDialogComponent>
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  public $playlists: Observable<Playlist[]> = this.playlistService.$playlists.pipe(
    takeUntil(this.$destroy),
    map((playlists) => playlists.filter((pl) => pl?.author?.id == this.authService.getUser()?.id || pl?.collaborative))
  );

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async choosePlaylist(playlist: Playlist) {
    this.dialogRef.close(playlist);
  }

  public async openPlaylistEditor() {
    (await this.playlistService.openEditorDialog({ mode: "create" })).afterClosed().pipe(takeUntil(this.$destroy)).subscribe((playlist) => {
      if(playlist) this.dialogRef.close(playlist)
    })
  }

}
