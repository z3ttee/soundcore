import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SSOService } from '@soundcore/sso';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService } from '@soundcore/ngx';
import { PlayableEntity, PlayableEntityType, Playlist, PlaylistAddSongFailReason, SCSDKLikeService, SCSDKPlaylistService, Song } from '@soundcore/sdk';
import { AppPlaylistChooseDialog } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.component';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { isNull } from '@soundcore/common';

@Component({
  selector: 'app-song-context-menu',
  templateUrl: './song-context-menu.component.html',
  styleUrls: ['./song-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SongContextMenuComponent implements OnInit, OnDestroy {

  @Input() public song: Song;
  @Input() public owner: PlayableEntity;
  @Input() public index: number;

  constructor(
    private readonly authService: SSOService,
    private readonly playlistService: SCSDKPlaylistService,
    private readonly dialog: SCNGXDialogService,
    private readonly snackbar: MatSnackBar,
    private readonly player: PlayerService,
    private readonly likeService: SCSDKLikeService,
    private readonly cdr: ChangeDetectorRef
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
      if(typeof playlist === "undefined" || playlist == null || typeof this.song === "undefined" || this.song == null) return;
      this.addSong(playlist.id, false);
    })
  }

  public openForceAddSongDialog(playlistId: string) {
    this.dialog.confirm("Der Song befindet sich bereits in der Playlist. Möchtest du ihn dennoch hinzufügen?", "Bereits hinzugefügt").$afterClosed.subscribe((confirmed) => {
      if(!confirmed) return;
      this.addSong(playlistId, true);
    })
  }

  private addSong(playlistId: string, force: boolean = false) {
    const song = this.song;

    this.playlistService.addSongToPlaylist(playlistId, {
      targetSongId: song.id,
      force
    }).subscribe((response) => {
      if(response.error || (response.payload?.failed && response.payload?.failReason == PlaylistAddSongFailReason.ERROR)) {
        this.snackbar.open(`Song konnte nicht zur Playlist hinzugefügt werden.`, null, { duration: 5000 });
        console.error(response.error);
        return;
      }

      const result = response.payload;
      if(result.failed) {
        if(result.failReason == PlaylistAddSongFailReason.NOT_FOUND) {
          this.snackbar.open(`Dieser Song existiert nicht.`, null, { duration: 5000 });
        }
        if(result.failReason == PlaylistAddSongFailReason.DUPLICATE && !force) {
          this.openForceAddSongDialog(playlistId);
        }
        return;
      }

      this.snackbar.open(`Song wurde zur Playlist hinzugefügt.`, null, { duration: 5000 });
    })
  }

  /**
   * Request the playerService to play the song
   * next by adding it to the queue
   */
  public playNext() {
    this.player.playNext(this.song).subscribe();
  }

  public forcePlay() {
    if(isNull(this.owner) || this.owner.type === PlayableEntityType.SONG) {
      this.player.forcePlay(this.song).subscribe();
      return;
    }

    this.player.forcePlayAt(this.owner, this.index, this.song.id).subscribe();
  }

  public removeFromPlaylist() {
    throw new Error(`TODO`)
  }

  public toggleLikeForSong() {
    const song = this.song as Song;

    if(!this.song) return;
    this.likeService.toggleLikeForSong(song).subscribe((request) => {
      if(request.loading) return;
      if(request.error) {
        this.snackbar.open("Ein Fehler ist aufgetreten.", null, { duration: 3000 });
        return;
      }

      song.liked = request.data.isLiked ?? song.liked;
      this.cdr.detectChanges();

      if(song.liked) {
        this.snackbar.open(`Song zu Lieblingssongs hinzugefügt.`, null, { duration: 3000 });
      } else {
        this.snackbar.open(`Song von Lieblingssongs entfernt.`, null, { duration: 3000 });
      }
    })
  }

}
