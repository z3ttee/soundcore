import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXUiSectionTitleComponent } from './ui-section-title.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SCNGXUiSectionTitleComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    SCNGXUiSectionTitleComponent
  ]
})
export class SCNGXUiSectionTitleModule { }
