import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongContextMenuComponent } from './song-context-menu.component';
import { SCCDKContextMenuModule } from '@soundcore/cdk';
import { HeroIconModule, viewGridAdd, collection, heart } from 'ng-heroicon';
import { AppPlaylistChooseDialogModule } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SCNGXDialogModule } from '@soundcore/ngx';
import { SCSDKCollectionModule } from '@soundcore/sdk';

@NgModule({
  declarations: [
    SongContextMenuComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ viewGridAdd, collection, heart }),
    SCCDKContextMenuModule,

    SCNGXDialogModule,

    AppPlaylistChooseDialogModule,
    MatSnackBarModule,

    SCSDKCollectionModule
  ],
  exports: [
    SongContextMenuComponent,
    SCCDKContextMenuModule
  ]
})
export class SongContextMenuModule { }
