import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorizontalGridComponent } from './horizontal-grid/horizontal-grid.component';
import { VerticalGridComponent } from './vertical-grid/vertical-grid.component';

@NgModule({
  declarations: [
    HorizontalGridComponent,
    VerticalGridComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HorizontalGridComponent,
    VerticalGridComponent
  ]
})
export class AscGridsModule { }
