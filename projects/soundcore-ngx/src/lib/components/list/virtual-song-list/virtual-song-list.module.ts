import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXVirtualSongListComponent } from './virtual-song-list.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SCNGXSongListItemModule } from '../song-list-item/song-list-item.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

@NgModule({
  declarations: [
    SCNGXVirtualSongListComponent
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    VirtualScrollerModule,

    SCNGXSongListItemModule
  ],
  exports: [
    SCNGXVirtualSongListComponent,
    SCNGXSongListItemModule
  ]
})
export class SCNGXVirtualSongListModule { }
