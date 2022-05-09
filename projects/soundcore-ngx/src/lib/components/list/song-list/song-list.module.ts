import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSongListComponent } from './song-list.component';
import { SCNGXSongListItemModule } from '../song-list-item/song-list-item.module';

@NgModule({
  declarations: [
    SCNGXSongListComponent
  ],
  imports: [
    CommonModule,
    SCNGXSongListItemModule
  ],
  exports: [
    SCNGXSongListComponent
  ]
})
export class SCNGXSongListModule { }
