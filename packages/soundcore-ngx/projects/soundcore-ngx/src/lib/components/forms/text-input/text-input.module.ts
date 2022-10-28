import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXTextInputComponent } from './text-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SCNGXLabelModule } from '../label/label.module';

@NgModule({
  declarations: [
    SCNGXTextInputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SCNGXLabelModule
  ],
  exports: [
    SCNGXTextInputComponent
  ]
})
export class SCNGXTextInputModule { }
