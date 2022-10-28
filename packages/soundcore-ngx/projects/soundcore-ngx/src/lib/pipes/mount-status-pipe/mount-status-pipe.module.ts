import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXMountStatusPipe } from './mount-status-pipe.pipe';

@NgModule({
  declarations: [
    SCNGXMountStatusPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXMountStatusPipe
  ]
})
export class SCNGXMountStatusPipeModule { }
