import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXLabelModule } from './label/label.module';
import { SCNGXTextInputModule } from './text-input/text-input.module';
import { SCNGXHintModule } from './hint/hint.module';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    SCNGXLabelModule,
    SCNGXTextInputModule,
    SCNGXHintModule
  ],
  exports: [
    SCNGXLabelModule,
    SCNGXTextInputModule
  ]
})
export class SCNGXFormsModule { }
