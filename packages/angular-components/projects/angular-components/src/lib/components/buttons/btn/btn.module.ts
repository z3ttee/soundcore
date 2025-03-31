import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { SCNGXBtnBaseComponent } from './btn-base/btn.component';
import { SCNGXBtnOutlinedComponent } from './btn-outlined/btn.component';
import { SCNGXBtnTextComponent } from './btn-text/btn.component';

@NgModule({
  declarations: [
    SCNGXBtnBaseComponent,
    SCNGXBtnOutlinedComponent,
    SCNGXBtnTextComponent
  ],
  imports: [
    CommonModule,
    LottieComponent
  ],
  exports: [
    SCNGXBtnBaseComponent,
    SCNGXBtnOutlinedComponent,
    SCNGXBtnTextComponent
  ]
})
export class SCNGXButtonModule { }
