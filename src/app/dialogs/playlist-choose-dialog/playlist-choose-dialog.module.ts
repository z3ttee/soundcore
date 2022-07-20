import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtworkModule, SCNGXButtonModule, SCNGXDialogModule, SCNGXLoadingBtnModule } from 'soundcore-ngx';
import { AppPlaylistChooseDialog } from './playlist-choose-dialog.component';
import { SCDKPlaylistModule } from 'soundcore-sdk';
import { ReactiveFormsModule } from '@angular/forms';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { GenericResourceListItemModule } from 'src/app/components/list-items/generic-resource-list-item/generic-resource-list-item.module';

@NgModule({
  declarations: [
    AppPlaylistChooseDialog
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SCNGXDialogModule,
    SCNGXButtonModule,
    SCDKPlaylistModule,

    VirtualScrollerModule,

    SCNGXArtworkModule,
    GenericResourceListItemModule

  ],
  exports: [
    SCNGXDialogModule
  ]
})
export class AppPlaylistChooseDialogModule { }
