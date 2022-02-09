import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscPlaylistEditorDialogComponent } from './playlist-editor-dialog.component';
import { AscMessageModule } from '../../message-components/message-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AscPlaylistEditorDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    AscMessageModule,

    MatInputModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class AscPlaylistEditorDialogModule { }
