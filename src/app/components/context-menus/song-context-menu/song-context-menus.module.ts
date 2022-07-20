import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongContextMenuComponent } from './song-context-menu.component';
import { SCCDKContextMenuModule } from 'soundcore-cdk';
import { HeroIconModule, viewGridAdd } from 'ng-heroicon';
import { AppPlaylistChooseDialogModule } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GenericResourceListItemModule } from '../../list-items/generic-resource-list-item/generic-resource-list-item.module';

@NgModule({
  declarations: [
    SongContextMenuComponent
  ],
  imports: [
    CommonModule,
    SCCDKContextMenuModule,
    HeroIconModule.withIcons({ viewGridAdd }),

    AppPlaylistChooseDialogModule,
    MatSnackBarModule
  ],
  exports: [
    SCCDKContextMenuModule,
    SongContextMenuComponent
  ]
})
export class SongContextMenuModule { }
