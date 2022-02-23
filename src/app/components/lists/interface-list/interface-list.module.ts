import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscInterfaceListComponent } from './interface-list.component';

@NgModule({
  declarations: [
    AscInterfaceListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AscInterfaceListComponent
  ]
})
export class AscInterfaceListModule { }
