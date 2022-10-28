import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXBtnBaseComponent } from './btn-base/btn.component';
import { HeroIconModule } from 'ng-heroicon';
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
    HeroIconModule
  ],
  exports: [
    SCNGXBtnBaseComponent,
    SCNGXBtnOutlinedComponent,
    SCNGXBtnTextComponent
  ]
})
export class SCNGXButtonModule { }
