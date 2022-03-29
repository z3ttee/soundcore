import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeekerComponent } from './seeker/seeker.component';

@NgModule({
  declarations: [
    SeekerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SeekerComponent
  ]
})
export class AscInputModule { }
