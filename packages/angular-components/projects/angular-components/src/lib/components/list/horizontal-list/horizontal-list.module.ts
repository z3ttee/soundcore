import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCNGXHorizontalListComponent } from './horizontal-list.component';

@NgModule({
  declarations: [
    SCNGXHorizontalListComponent
  ],
  imports: [
    CommonModule,
    ScrollingModule
  ],
  exports: [
    SCNGXHorizontalListComponent
  ]
})
export class SCNGXHorizontalListModule { }
