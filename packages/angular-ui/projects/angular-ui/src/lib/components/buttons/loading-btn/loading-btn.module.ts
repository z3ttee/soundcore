import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { SCNGXButtonModule } from '../btn/btn.module';
import { SCNGXLoadingBtnBaseComponent } from './btn-base/btn.component';
import { SCNGXLoadingBtnOutlinedComponent } from './btn-outlined/btn.component';
import { SCNGXLoadingBtnTextComponent } from './btn-text/btn.component';

@NgModule({
  declarations: [
    SCNGXLoadingBtnBaseComponent,
    SCNGXLoadingBtnOutlinedComponent,
    SCNGXLoadingBtnTextComponent
  ],
  imports: [
    CommonModule,
    SCNGXButtonModule,
    LottieComponent
  ],
  exports: [
    SCNGXLoadingBtnBaseComponent,
    SCNGXLoadingBtnOutlinedComponent,
    SCNGXLoadingBtnTextComponent
  ]
})
export class SCNGXLoadingBtnModule { }
