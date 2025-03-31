import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { SCNGXButtonModule } from '../btn/btn.module';
import { SCNGXIconBtnBaseComponent } from './btn-base/btn.component';
import { SCNGXIconBtnOutlinedComponent } from './btn-outlined/btn.component';
import { SCNGXIconBtnTextComponent } from './btn-text/btn.component';

@NgModule({
  declarations: [
    SCNGXIconBtnBaseComponent,
    SCNGXIconBtnOutlinedComponent,
    SCNGXIconBtnTextComponent
  ],
  imports: [
    CommonModule,
    SCNGXButtonModule,
    LottieComponent
  ],
  exports: [
    SCNGXIconBtnBaseComponent,
    SCNGXIconBtnOutlinedComponent,
    SCNGXIconBtnTextComponent
  ]
})
export class SCNGXIconBtnModule { }
