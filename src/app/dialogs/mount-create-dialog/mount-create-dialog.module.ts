import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from 'soundcore-ngx';
import { AppMountCreateDialog } from './mount-create-dialog.component'
import { SCDKMountModule } from 'soundcore-sdk';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  declarations: [
    AppMountCreateDialog
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SCNGXDialogModule,
    SCNGXButtonModule,
    SCNGXLoadingBtnModule,
    SCDKMountModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [
    SCNGXDialogModule
  ]
})
export class AppMountCreateDialogModule { }
