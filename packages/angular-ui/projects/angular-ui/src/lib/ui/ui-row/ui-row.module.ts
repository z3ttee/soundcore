import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXUiRowComponent } from './ui-row.component';
import { RouterModule } from '@angular/router';
import { SCNGXUiSectionTitleModule } from '../ui-section-title/ui-section-title.module';

@NgModule({
  declarations: [
    SCNGXUiRowComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SCNGXUiSectionTitleModule
  ],
  exports: [
    SCNGXUiRowComponent,
    SCNGXUiSectionTitleModule
  ]
})
export class SCNGXUiRowModule { }
