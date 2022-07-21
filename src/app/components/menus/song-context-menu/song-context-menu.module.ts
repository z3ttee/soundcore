import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongContextMenuComponent } from './song-context-menu.component';
import { SCCDKContextMenuModule } from 'soundcore-cdk';
import { HeroIconModule, viewGridAdd, collection } from 'ng-heroicon';
import { AppPlaylistChooseDialogModule } from 'src/app/dialogs/playlist-choose-dialog/playlist-create-dialog.module';

@NgModule({
  declarations: [
    SongContextMenuComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ viewGridAdd, collection }),
    SCCDKContextMenuModule,

    AppPlaylistChooseDialogModule
  ],
  exports: [
    SongContextMenuComponent,
    SCCDKContextMenuModule
  ]
})
export class SongContextMenuModule { }