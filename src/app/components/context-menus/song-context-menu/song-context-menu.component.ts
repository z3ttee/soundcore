import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, take, takeUntil } from 'rxjs';
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
  @Input() public song: Song;
  @Input() public isPlayable: boolean = true;
  @Input() public isPlaying: boolean = false;

  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,

    private contextService: ContextMenuService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  public $isPlayerPaused: Observable<boolean> = this.audioService.$paused.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async open(event: MouseEvent) {
    this.templateRef.open(event);
  }

  public async openChoosePlaylist() {
    const ref = this.dialog.open(AscChoosePlaylistDialogComponent)

    ref.afterClosed().subscribe((playlist: Playlist) => {
      if(!playlist) return;
      this.playlistService.addSongs(playlist.id, [ this.song.id ]).then(() => {
        this.snackbar.open("Song wurde zur Playlist hinzugefügt", null, { duration: 4000 })
      }).catch((reason) => {
        console.error(reason)
        this.snackbar.open("Song konnte nicht zur Playlist hinzugefügt werden.", null, { duration: 4000 })
      }).finally(() => {
        this.contextService.close();
      })
    })
  }

  public async enqueue() {
      this.audioService.enqueueSong(this.song)
      this.contextService.close();
  }

  public async playOrPause() {
    if(!this.isPlayable) return;

    this.contextService.close();

    if(this.isPlaying) {
      this.$isPlayerPaused.pipe(take(1)).subscribe((isPaused) => {
        if(isPaused) this.audioService.play();
        else this.audioService.pause();
      })
    } else {
      this.audioService.play(this.song);
    }
    
}

}
