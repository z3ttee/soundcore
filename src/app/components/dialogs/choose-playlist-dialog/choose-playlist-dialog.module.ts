import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscChoosePlaylistDialogComponent } from './choose-playlist-dialog.component';
import { AscPlaylistModule } from '../../playlist-components/playlist-components.module';

@NgModule({
  declarations: [
    AscChoosePlaylistDialogComponent
  ],
  imports: [
    CommonModule,

    AscPlaylistModule
  ],
  exports: [
    AscChoosePlaylistDialogComponent
  ]
})
export class AscChoosePlaylistDialogModule { }
