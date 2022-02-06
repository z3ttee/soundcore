import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, Subject, take, takeUntil } from 'rxjs';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { AscChoosePlaylistDialogComponent } from '../../dialogs/choose-playlist-dialog/choose-playlist-dialog.component';
import { AscContextMenuTemplateComponent } from '../context-menu-template/context-menu-template.component';

@Component({
  selector: 'asc-song-context-menu',
  templateUrl: './song-context-menu.component.html',
  styleUrls: ['./song-context-menu.component.scss']
})
export class SongContextMenuComponent implements OnInit, OnDestroy {

  @ViewChild('templateRef') public templateRef: AscContextMenuTemplateComponent;
  
  @Input() public isPlayable: boolean = true;

  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,

    private contextService: ContextMenuService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  public song: Song;
  public playlist: Playlist;

  public $isPlaying: Observable<boolean> = this.audioService.$currentSong.pipe(takeUntil(this.$destroy), map((song) => !!song && song?.id == this.song?.id));
  public $isPlayerPaused: Observable<boolean> = this.audioService.$paused.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async open(event: MouseEvent, contextData?: Song, playlistContext?: Playlist) {
    this.song = contextData;
    this.playlist = playlistContext;

    this.templateRef.open(event);
  }

  public async openChoosePlaylist() {
    const ref = this.dialog.open(AscChoosePlaylistDialogComponent)

    ref.afterClosed().subscribe((playlist: Playlist) => {
      if(!playlist) return;
      this.playlistService.addSongs(playlist.id, [ this.song.id ]).then(() => {
        this.snackbar.open("Song wurde zur Playlist hinzugefügt", null, { duration: 4000 })
      }).catch((reason: HttpErrorResponse) => {
        console.error(reason)

        if(reason.status == 409) {
          this.snackbar.open("Dieser Song existiert bereits in der Playlist.", null, { duration: 4000 })
        } else {
          this.snackbar.open("Song konnte nicht zur Playlist hinzugefügt werden.", null, { duration: 4000 })
        }
      }).finally(() => {
        this.contextService.close();
      })
    })
  }

  public async removeFromPlaylist() {
    if(!this.playlist) {
      this.contextService.close();
      return
    }

    this.playlistService.removeSongs(this.playlist.id, [ this.song.id ]).then(() => {
      this.snackbar.open("Song wurde aus der Playlist entfernt.", null, { duration: 4000 })
    }).catch((reason: HttpErrorResponse) => {
      console.error(reason);

      this.snackbar.open("Song konnte nicht aus der Playlist entfernt werden.", null, { duration: 4000 })
    }).finally(() => {
      this.contextService.close();
    })
  }

  public async enqueue() {
      this.audioService.enqueueSong(this.song)
      this.contextService.close();
  }

  public async playOrPause() {
    if(!this.isPlayable) return;

    this.contextService.close();

    this.$isPlaying.pipe(take(1)).subscribe((isPlaying) => {
      if(isPlaying) {
        this.$isPlayerPaused.pipe(take(1)).subscribe((isPaused) => {
          if(isPaused) this.audioService.play();
          else this.audioService.pause();
        })
      } else {
        this.audioService.play(this.song);
      }
    })
}

}
