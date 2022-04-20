import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXVirtualSongListComponent } from './virtual-song-list.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SCNGXSongListItemModule } from '../song-list-item/song-list-item.module';

@NgModule({
  declarations: [
    SCNGXVirtualSongListComponent
  ],
  imports: [
    CommonModule,
    ScrollingModule,

    SCNGXSongListItemModule
  ],
  exports: [
    SCNGXVirtualSongListComponent,
    SCNGXSongListItemModule
  ]
})
export class SCNGXVirtualSongListModule { }
