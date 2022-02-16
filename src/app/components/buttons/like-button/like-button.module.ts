import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscLikeButtonComponent } from './like-button.component';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AscLikeButtonComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule
  ],
  exports: [
    AscLikeButtonComponent
  ]
})
export class AscLikeButtonModule { }
