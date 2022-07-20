import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from 'soundcore-ngx';
import { AppPlaylistChooseDialog } from './playlist-create-dialog.component';
import { SCDKPlaylistModule } from 'soundcore-sdk';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  declarations: [
    AppPlaylistChooseDialog
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SCNGXDialogModule,
    SCNGXButtonModule,
    SCNGXLoadingBtnModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [
    SCNGXDialogModule
  ]
})
export class AppPlaylistChooseDialogModule { }
