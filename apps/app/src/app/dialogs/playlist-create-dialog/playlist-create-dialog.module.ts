import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from '@soundcore/ngx';
import { AppPlaylistCreateDialog } from './playlist-create-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { SCSDKPlaylistModule } from '@soundcore/sdk';

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
