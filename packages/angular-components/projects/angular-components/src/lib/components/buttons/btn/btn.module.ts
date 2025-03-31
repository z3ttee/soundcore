import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
  ],
  exports: [
    SCNGXBtnBaseComponent,
    SCNGXBtnOutlinedComponent,
    SCNGXBtnTextComponent
  ]
})
export class SCNGXButtonModule { }
