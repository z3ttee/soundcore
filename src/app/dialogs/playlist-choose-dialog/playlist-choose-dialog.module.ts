import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtworkModule, SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from 'soundcore-ngx';
import { AppPlaylistChooseDialog } from './playlist-choose-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { GenericResourceListItemModule } from 'src/app/components/list-items/generic-resource-list-item/generic-resource-list-item.module';
import { AppPlaylistCreateDialogModule } from '../playlist-create-dialog/playlist-create-dialog.module';
import { HeroIconModule, plus } from 'ng-heroicon';

@NgModule({
  declarations: [
    AppPlaylistChooseDialog
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ plus }),
    ReactiveFormsModule,

    SCNGXDialogModule,
    SCNGXButtonModule,

    VirtualScrollerModule,

    SCNGXArtworkModule,
    GenericResourceListItemModule,
    AppPlaylistCreateDialogModule
  ],
  exports: [
    SCNGXDialogModule
  ]
})
export class AppPlaylistChooseDialogModule { }
