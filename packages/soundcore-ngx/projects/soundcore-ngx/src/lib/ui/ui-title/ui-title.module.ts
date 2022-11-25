import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXUiTitleComponent } from './ui-title.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SCNGXUiTitleComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    SCNGXUiTitleComponent
  ]
})
export class SCNGXUiTitleModule { }
