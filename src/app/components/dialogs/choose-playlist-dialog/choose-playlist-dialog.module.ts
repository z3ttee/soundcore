import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscChoosePlaylistDialogComponent } from './choose-playlist-dialog.component';
import { AscPlaylistModule } from '../../playlist-components/playlist-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AscChoosePlaylistDialogComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,

    AscPlaylistModule
  ],
  exports: [
    AscChoosePlaylistDialogComponent
  ]
})
export class AscChoosePlaylistDialogModule { }
