import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule } from '../btn/btn.module';
import { SCNGXIconBtnBaseComponent } from './btn-base/btn.component';
import { SCNGXIconBtnOutlinedComponent } from './btn-outlined/btn.component';
import { SCNGXIconBtnTextComponent } from './btn-text/btn.component';
import { LottieModule } from 'ngx-lottie';

@NgModule({
  declarations: [
    SCNGXIconBtnBaseComponent,
    SCNGXIconBtnOutlinedComponent,
    SCNGXIconBtnTextComponent
  ],
  imports: [
    CommonModule,
    SCNGXButtonModule,
    LottieModule
  ],
  exports: [
    SCNGXIconBtnBaseComponent,
    SCNGXIconBtnOutlinedComponent,
    SCNGXIconBtnTextComponent
  ]
})
export class SCNGXIconBtnModule { }
