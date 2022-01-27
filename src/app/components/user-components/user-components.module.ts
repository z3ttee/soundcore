import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGridItemComponent } from './user-grid-item/user-grid-item.component';
import { AscImageModule } from '../image-components/image-components.module';

@NgModule({
  declarations: [
    UserGridItemComponent
  ],
  imports: [
    CommonModule,
    AscImageModule
  ],
  exports: [
    UserGridItemComponent
  ]
})
export class AscUserModule { }
