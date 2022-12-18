import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongContextMenuComponent } from './song-context-menu.component';
import { SCCDKContextMenuModule } from '@soundcore/cdk';
import { HeroIconModule, viewGridAdd, collection, play, minus } from 'ng-heroicon';
import { AppPlaylistChooseDialogModule } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SCNGXDialogModule, SCNGXDividerModule } from '@soundcore/ngx';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SongContextMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    HeroIconModule.withIcons({ viewGridAdd, minus, collection, play }),
    SCCDKContextMenuModule,

    SCNGXDialogModule,
    SCNGXDividerModule,

    AppPlaylistChooseDialogModule,
    MatSnackBarModule
  ],
  exports: [
    SongContextMenuComponent,
    SCCDKContextMenuModule
  ]
})
export class SongContextMenuModule { }
