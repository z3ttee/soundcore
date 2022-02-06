import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayableList } from 'src/app/entities/playable-list.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { AscContextMenuTemplateComponent } from '../context-menu-template/context-menu-template.component';

@Component({
  selector: 'asc-playlist-context-menu',
  templateUrl: './playlist-context-menu.component.html',
  styleUrls: ['./playlist-context-menu.component.scss']
})
export class AscPlaylistContextMenuComponent implements OnInit {

  @ViewChild('templateRef') public templateRef: AscContextMenuTemplateComponent;
  @Input() public playlist: Playlist;

  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,

    private contextService: ContextMenuService,
    private snackbar: MatSnackBar,
  ) { }

  public ngOnInit(): void {}

  public async open(event: MouseEvent) {
    this.templateRef.open(event);
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
