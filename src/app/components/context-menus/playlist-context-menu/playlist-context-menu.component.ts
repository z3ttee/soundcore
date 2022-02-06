import { Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayableList } from 'src/app/entities/playable-list.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { Breakpoint, DeviceService } from 'src/app/services/device.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'asc-playlist-context-menu',
  templateUrl: './playlist-context-menu.component.html',
  styleUrls: ['./playlist-context-menu.component.scss']
})
export class AscPlaylistContextMenuComponent implements OnInit {

  @ViewChild('menuRef') public menuRef: TemplateRef<any>;
  @Input() public playlist: Playlist;

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,
    private deviceService: DeviceService,

    private contextService: ContextMenuService,
    private viewContainerRef: ViewContainerRef,
    
    private snackbar: MatSnackBar,
  ) { }

  public $breakpoint: Observable<Breakpoint> = this.deviceService.$breakpoint.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}

  public async open(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.contextService.open(event, this.menuRef, this.viewContainerRef, this.playlist)
  }

  public async playList() {
    const list = PlayableList.forPlaylist(this.playlist.id, 0);
    this.audioService.playList(list);
    this.contextService.close();
  }

  public async enqueueList() {
    const list = PlayableList.forPlaylist(this.playlist.id, 0);
    this.audioService.enqueueList(list)
    this.contextService.close();
  }

  public async deletePlaylist() {
    this.playlistService.deleteById(this.playlist?.id).catch(() => {
      this.snackbar.open("Playlist konnte nicht gelöscht werden.")
    }).finally(() => {
      this.contextService.close();
    })
  }

}
