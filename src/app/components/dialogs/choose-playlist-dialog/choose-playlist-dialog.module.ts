import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscChoosePlaylistDialogComponent } from './choose-playlist-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AscPlaylistListItemModule } from '../../playlist-components/playlist-list-item/playlist-list-item.module';

@NgModule({
  declarations: [
    AscChoosePlaylistDialogComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,

    AscPlaylistListItemModule
  ],
  exports: [
    AscChoosePlaylistDialogComponent
  ]
})
export class AscChoosePlaylistDialogModule { }
