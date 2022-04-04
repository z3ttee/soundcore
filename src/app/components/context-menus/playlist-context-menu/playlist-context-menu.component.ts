import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, map, Observable, Subject, takeUntil } from 'rxjs';
import { Playlist, SCDKPlaylistService } from 'soundcore-sdk';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { DeviceService } from 'src/app/services/device.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ListCreator } from 'src/lib/data/list-creator';
import { AuthenticationService } from 'src/sso/services/authentication.service';
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
    private playlistService: SCDKPlaylistService,
    public authService: AuthenticationService,
    public deviceService: DeviceService,
    private dialogService: DialogService,

    private contextService: ContextMenuService,
    private snackbarService: SnackbarService,
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
    firstValueFrom(this.playlistService.deleteById(this.playlist?.id)).then(() => {
      this.snackbarService.info("Playlist gelöscht.")
    }).catch(() => {
      this.snackbarService.error("Playlist konnte nicht gelöscht werden.")
    })
  }

  public async editPlaylist() {
    this.contextService.close();
    this.dialogService.openPlaylistEditorDialog({ mode: "edit", contextData: this.playlist })
  }

}
