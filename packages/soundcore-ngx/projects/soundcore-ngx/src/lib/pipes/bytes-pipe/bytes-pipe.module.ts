import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXBytesPipe } from './bytes-pipe.pipe';

@NgModule({
  declarations: [
    SCNGXBytesPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXBytesPipe
  ]
})
export class SCNGXBytesPipeModule { }
