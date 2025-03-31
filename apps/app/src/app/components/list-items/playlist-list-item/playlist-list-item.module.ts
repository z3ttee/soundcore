import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCNGXArtworkModule } from '@repo/angular-ui';
import { SCNGXPlaylistListItemComponent } from './playlist-list-item.component';

@NgModule({
  declarations: [
    SCNGXPlaylistListItemComponent
  ],
  imports: [
    CommonModule,

    SCNGXArtworkModule,
  ],
  exports: [
    SCNGXPlaylistListItemComponent
  ]
})
export class SCNGXPlaylistListItemModule { }
