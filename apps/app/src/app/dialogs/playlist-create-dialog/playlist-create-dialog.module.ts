import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from '@repo/angular-ui';
import { SCSDKPlaylistModule } from '@repo/angular-sdk';
import { AppPlaylistCreateDialog } from './playlist-create-dialog.component';

@NgModule({
  declarations: [
    AppPlaylistCreateDialog
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SCNGXDialogModule,
    SCNGXButtonModule,
    SCNGXLoadingBtnModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    SCSDKPlaylistModule
  ],
  exports: [
    SCNGXDialogModule
  ]
})
export class AppPlaylistCreateDialogModule { }
