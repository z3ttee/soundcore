import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroHeart, heroRectangleStack, heroSquaresPlus } from '@ng-icons/heroicons/outline';
import { heroMinusSolid, heroPlaySolid } from '@ng-icons/heroicons/solid';
import { SCNGXDialogModule, SCNGXDividerModule } from '@repo/angular-components';
import { SCSDKCollectionModule } from '@repo/angular-sdk';
import { SCCDKContextMenuModule } from '@soundcore/cdk';
import { AppPlaylistChooseDialogModule } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.module';
import { SongContextMenuComponent } from './song-context-menu.component';

@NgModule({
  declarations: [
    SongContextMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgIconsModule.withIcons({ heroSquaresPlus, heroRectangleStack, heroHeart, heroPlaySolid, heroMinusSolid }),
    SCCDKContextMenuModule,

    SCNGXDialogModule,
    SCNGXDividerModule,

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
