import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXFileFlagPipe } from './file-flag-pipe.pipe';

@NgModule({
  declarations: [
    SCNGXFileFlagPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXFileFlagPipe
  ]
})
export class SCNGXFileFlagPipeModule { }
