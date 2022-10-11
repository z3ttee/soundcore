import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXUiRowComponent } from './ui-row.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SCNGXUiRowComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    SCNGXUiRowComponent
  ]
})
export class SCNGXUiRowModule { }
