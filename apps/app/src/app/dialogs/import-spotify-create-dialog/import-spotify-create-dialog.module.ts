import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from '@repo/angular-ui';
import { SCSDKImportModule } from '@repo/angular-sdk';
import { AppImportSpotifyCreateDialog } from './import-spotify-create-dialog.component';

@NgModule({
  declarations: [
    AppImportSpotifyCreateDialog
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

    SCSDKImportModule
  ],
  exports: [
    SCNGXDialogModule,
    SCSDKImportModule
  ]
})
export class AppImportSpotifyCreateDialogModule { }
