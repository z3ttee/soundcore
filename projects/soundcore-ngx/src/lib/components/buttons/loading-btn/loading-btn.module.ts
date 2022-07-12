import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule } from '../btn/btn.module';
import { SCNGXLoadingBtnBaseComponent } from './btn-base/btn.component';
import { SCNGXLoadingBtnOutlinedComponent } from './btn-outlined/btn.component';
import { SCNGXLoadingBtnTextComponent } from './btn-text/btn.component';
import { LottieModule } from 'ngx-lottie';

@NgModule({
  declarations: [
    SCNGXLoadingBtnBaseComponent,
    SCNGXLoadingBtnOutlinedComponent,
    SCNGXLoadingBtnTextComponent
  ],
  imports: [
    CommonModule,
    SCNGXButtonModule,
    LottieModule
  ],
  exports: [
    SCNGXLoadingBtnBaseComponent,
    SCNGXLoadingBtnOutlinedComponent,
    SCNGXLoadingBtnTextComponent
  ]
})
export class SCNGXLoadingBtnModule { }
