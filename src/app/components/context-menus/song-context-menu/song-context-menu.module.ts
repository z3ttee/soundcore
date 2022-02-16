import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongContextMenuComponent } from './song-context-menu.component';
import { AscContextMenuTemplateModule } from '../context-menu-template/context-menu-template.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AscChoosePlaylistDialogModule } from '../../dialogs/choose-playlist-dialog/choose-playlist-dialog.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SongContextMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    MatSnackBarModule,
    AscContextMenuTemplateModule,
    AscChoosePlaylistDialogModule
  ],
  exports: [
    SongContextMenuComponent
  ]
})
export class AscSongContextMenuModule { }
