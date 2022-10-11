import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXAddedToPlaylistPipe } from './added-to-playlist.pipe';

@NgModule({
  declarations: [
    SCNGXAddedToPlaylistPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXAddedToPlaylistPipe
  ]
})
export class SCNGXAddedToPlaylistPipeModule { }
