import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { DeviceService } from 'src/app/services/device.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { ListCreator } from 'src/lib/data/list-creator';
import { AscContextMenuTemplateComponent } from '../context-menu-template/context-menu-template.component';

@Component({
  selector: 'asc-playlist-context-menu',
  templateUrl: './playlist-context-menu.component.html',
  styleUrls: ['./playlist-context-menu.component.scss']
})
export class AscPlaylistContextMenuComponent implements OnInit, OnDestroy {

  @ViewChild('templateRef') public templateRef: AscContextMenuTemplateComponent;
  @Input() public playlist: Playlist;

  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,
    public authService: AuthenticationService,
    public deviceService: DeviceService,

    private contextService: ContextMenuService,
    private snackbar: MatSnackBar,
    private listCreator: ListCreator
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  public $isDesktop: Observable<boolean> = this.deviceService.$breakpoint.pipe(takeUntil(this.$destroy), map((bp) => bp.isDesktop))

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  public async open(event: MouseEvent) {
    this.templateRef.open(event);
  }

  public async playList() {
    const list = this.listCreator.forPlaylist(this.playlist);
    this.audioService.playOrPauseList(list);
    this.contextService.close();
  }

  public async enqueueList() {
    const list = this.listCreator.forPlaylist(this.playlist);
    this.audioService.enqueueList(list)
    this.contextService.close();
  }

  public async deletePlaylist() {
    this.contextService.close();
    this.playlistService.deleteById(this.playlist?.id).catch(() => {
      this.snackbar.open("Playlist konnte nicht gelöscht werden.")
    })
  }

  public async editPlaylist() {
    this.contextService.close();
    this.playlistService.openEditorDialog({ mode: "edit", contextData: this.playlist })
  }

}
