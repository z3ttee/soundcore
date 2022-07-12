import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from 'soundcore-ngx';
import { AppPlaylistCreateDialog } from './playlist-create-dialog.component';
import { SCDKPlaylistModule } from 'soundcore-sdk';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

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
    SCDKPlaylistModule,

    MatFormFieldModule,
    MatInputModule
    
  ]
})
export class AppPlaylistCreateDialogModule { }
