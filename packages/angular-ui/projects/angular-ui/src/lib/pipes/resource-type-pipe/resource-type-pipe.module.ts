import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXResourceTypePipe } from './resource-type-pipe.pipe';

@NgModule({
  declarations: [
    SCNGXResourceTypePipe
  ],
  imports: [
    CommonModule
  ], 
  exports: [
    SCNGXResourceTypePipe
  ]
})
export class SCNGXResourceTypePipeModule { }
