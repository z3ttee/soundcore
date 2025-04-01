import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXZoneStatusPipe } from './zone-status-pipe.pipe';

@NgModule({
  declarations: [
    SCNGXZoneStatusPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXZoneStatusPipe
  ]
})
export class SCNGXZoneStatusPipeModule { }
