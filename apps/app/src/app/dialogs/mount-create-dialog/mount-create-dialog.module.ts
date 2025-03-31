import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from '@repo/angular-components';
import { SCSDKMountModule } from '@repo/angular-sdk';
import { AppMountCreateDialog } from './mount-create-dialog.component';

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
    SCSDKMountModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  exports: [
    SCNGXDialogModule,
    SCSDKMountModule,
  ]
})
export class AppMountCreateDialogModule { }
