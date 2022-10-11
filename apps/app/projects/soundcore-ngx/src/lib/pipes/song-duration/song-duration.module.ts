import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSongDurationPipe } from './song-duration.pipe';

@NgModule({
  declarations: [
    SCNGXSongDurationPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXSongDurationPipe
  ]
})
export class SCNGXSongDurationPipeModule { }
