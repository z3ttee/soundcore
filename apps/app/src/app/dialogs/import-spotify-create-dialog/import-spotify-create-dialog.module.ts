import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from '@soundcore/ngx';
import { AppImportSpotifyCreateDialog } from './import-spotify-create-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { SCSDKImportModule } from '@soundcore/sdk';

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
