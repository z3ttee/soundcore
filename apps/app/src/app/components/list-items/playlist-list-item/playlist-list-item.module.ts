import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXPlaylistListItemComponent } from './playlist-list-item.component';
import { SCNGXArtworkModule } from '@soundcore/ngx';

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
