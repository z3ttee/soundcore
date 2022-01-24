import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { ErrorMessageComponent } from './error/error-message.component';

@NgModule({
  declarations: [
    MessageComponent,
    ErrorMessageComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MessageComponent,
    ErrorMessageComponent
  ]
})
export class AscMessageModule { }
