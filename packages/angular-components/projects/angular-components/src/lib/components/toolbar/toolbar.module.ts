import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { SCNGXToolbarComponent } from './toolbar.component';

@NgModule({
  declarations: [
    SCNGXToolbarComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule
  ],
  exports: [
    SCNGXToolbarComponent
  ]
})
export class SCNGXToolbarModule { }
