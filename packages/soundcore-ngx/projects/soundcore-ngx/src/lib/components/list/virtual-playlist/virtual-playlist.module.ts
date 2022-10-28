import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXVirtualPlaylistComponent } from './virtual-playlist.component';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { SCNGXSongListItemModule } from '../song-list-item/song-list-item.module';

@NgModule({
  declarations: [
    SCNGXVirtualPlaylistComponent
  ],
  imports: [
    CommonModule,
    VirtualScrollerModule,

    SCNGXSongListItemModule
  ],
  exports: [
    SCNGXVirtualPlaylistComponent
  ]
})
export class SCNGXVirtualPlaylistModule { }
