import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXBucketFlagPipe } from './bucket-flag-pipe.pipe';

@NgModule({
  declarations: [
    SCNGXBucketFlagPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXBucketFlagPipe
  ]
})
export class SCNGXBucketFlagPipeModule { }
