import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, map, Observable, Subject, takeUntil } from 'rxjs';
import { Playlist, SCDKPlaylistService } from 'soundcore-sdk';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LikeService } from 'src/app/services/like.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
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
    private playlistService: SCDKPlaylistService,
    private likeService: LikeService,

    private router: Router,
    private contextService: ContextMenuService,
    private snackbarService: SnackbarService,
    private dialogService: DialogService
  ) { }

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  public song: Song;
  public playlist: Playlist;

  public $isPlaying: Observable<boolean> = this.audioService.$currentItem.pipe(takeUntil(this.$destroy), map((song) => !!song && song?.id == this.song?.id));
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
    const ref = this.dialogService.openSync(AscChoosePlaylistDialogComponent)

    ref.afterClosed().subscribe((playlist: Playlist) => {
      if(!playlist) return;
      
      firstValueFrom(this.playlistService.addSongs(playlist.id, [ this.song ])).then(() => {
        this.snackbarService.info(`Song zur Playlist "${playlist.title}" hinzugefügt`)
      }).catch((error) => {
        console.error(error)
        this.snackbarService.error(`Song konnte nicht zur Playlist "${playlist.title}" hinzugefügt werden.`)
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

    firstValueFrom(this.playlistService.removeSongs(this.playlist.id, [ this.song ])).then(() => {
      this.snackbarService.info(`Song aus Playlist "${this.playlist.title}" entfernt`)
    }).catch((error) => {
      console.error(error)
      this.snackbarService.error(`Song konnte nicht von der Playlist "${this.playlist.title}" entfernt werden.`)
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

    this.audioService.playOrPause(this.song);
  }

  public async toggleLike() {
    this.likeService.likeSong(this.song).finally(() => {
      this.contextService.close();
    })
  }

  public async navigateToIndex() {
    this.contextService.close();
    this.router.navigate(['/storage', 'index', this.song?.index?.id])
  }

}
