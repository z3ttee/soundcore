import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtworkModule, SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from '@soundcore/ngx';
import { AppPlaylistChooseDialog } from './playlist-choose-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GenericResourceListItemModule } from 'src/app/components/list-items/generic-resource-list-item/generic-resource-list-item.module';
import { AppPlaylistCreateDialogModule } from '../playlist-create-dialog/playlist-create-dialog.module';
import { SCSDKPlaylistModule } from '@soundcore/sdk';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlusSolid } from '@ng-icons/heroicons/solid';

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
