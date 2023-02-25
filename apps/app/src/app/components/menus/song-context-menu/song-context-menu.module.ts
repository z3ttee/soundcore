import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongContextMenuComponent } from './song-context-menu.component';
import { SCCDKContextMenuModule } from '@soundcore/cdk';
import { AppPlaylistChooseDialogModule } from 'src/app/dialogs/playlist-choose-dialog/playlist-choose-dialog.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SCNGXDialogModule } from '@soundcore/ngx';
import { SCSDKCollectionModule } from '@soundcore/sdk';
import { SCNGXDividerModule } from '@soundcore/ngx';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroSquaresPlus, heroRectangleStack, heroHeart } from '@ng-icons/heroicons/outline';
import { heroPlaySolid, heroMinusSolid } from '@ng-icons/heroicons/solid';

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
