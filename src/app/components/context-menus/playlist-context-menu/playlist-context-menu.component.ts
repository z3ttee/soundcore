import { Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { PlayableList } from 'src/app/entities/playable-list.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';

@Component({
  selector: 'asc-playlist-context-menu',
  templateUrl: './playlist-context-menu.component.html',
  styleUrls: ['./playlist-context-menu.component.scss']
})
export class PlaylistContextMenuComponent implements OnInit {

  @ViewChild('menuRef') public menuRef: TemplateRef<any>;
  @Input() public playlist: Playlist;

  constructor(
    private contextService: ContextMenuService,
    private viewContainerRef: ViewContainerRef
  ) { }

  public ngOnInit(): void {}

  public async open(event: MouseEvent) {
    this.contextService.open(event, this.menuRef, this.viewContainerRef, this.playlist)
  }

  

}
