import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlusSolid } from '@ng-icons/heroicons/solid';
import { SCNGXArtworkModule, SCNGXButtonModule, SCNGXDialogModule } from '@repo/angular-ui';
import { SCSDKPlaylistModule } from '@repo/angular-sdk';
import { GenericResourceListItemModule } from 'src/app/components/list-items/generic-resource-list-item/generic-resource-list-item.module';
import { AppPlaylistCreateDialogModule } from '../playlist-create-dialog/playlist-create-dialog.module';
import { AppPlaylistChooseDialog } from './playlist-choose-dialog.component';

@NgModule({
  declarations: [
    AppPlaylistChooseDialog
  ],
  imports: [
    CommonModule,
    NgIconsModule.withIcons({ heroPlusSolid }),
    ReactiveFormsModule,

    SCNGXDialogModule,
    SCNGXButtonModule,

    SCNGXArtworkModule,
    GenericResourceListItemModule,
    AppPlaylistCreateDialogModule,

    SCSDKPlaylistModule
  ],
  exports: [
    SCNGXDialogModule
  ]
})
export class AppPlaylistChooseDialogModule { }
