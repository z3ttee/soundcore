import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorizontalGridComponent } from './horizontal-grid/horizontal-grid.component';



@NgModule({
  declarations: [
    HorizontalGridComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HorizontalGridComponent
  ]
})
export class AscGridsModule { }
