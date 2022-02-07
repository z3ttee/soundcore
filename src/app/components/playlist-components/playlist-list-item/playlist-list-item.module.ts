import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistListItemComponent } from './playlist-list-item.component';
import { AscImageModule } from '../../image-components/image-components.module';
import { AscPlaylistContextMenuModule } from '../../context-menus/playlist-context-menu/playlist-context-menu.module';

@NgModule({
  declarations: [
    PlaylistListItemComponent
  ],
  imports: [
    CommonModule,

    AscImageModule,
    AscPlaylistContextMenuModule
  ],
  exports: [
    PlaylistListItemComponent
  ]
})
export class AscPlaylistListItemModule { }
