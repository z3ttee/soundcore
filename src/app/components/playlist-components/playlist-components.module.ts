import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AscImageModule } from '../image-components/image-components.module';
import { PlaylistSimpleListItemComponent } from './playlist-simple-list-item/playlist-simple-list-item.component';
import { AscPlaylistContextMenuModule } from '../context-menus/playlist-context-menu/playlist-context-menu.module';

@NgModule({
  declarations: [
    PlaylistSimpleListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    AscImageModule,
    AscPlaylistContextMenuModule
  ],
  exports: [
    PlaylistSimpleListItemComponent
  ]
})
export class AscPlaylistModule { }
