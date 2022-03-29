import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelGridItemComponent } from './label-grid-item/label-grid-item.component';
import { AscImageModule } from '../image-components/image-components.module';



@NgModule({
  declarations: [
    LabelGridItemComponent
  ],
  imports: [
    CommonModule,
    AscImageModule
  ],
  exports: [
    LabelGridItemComponent
  ]
})
export class AscLabelModule { }
