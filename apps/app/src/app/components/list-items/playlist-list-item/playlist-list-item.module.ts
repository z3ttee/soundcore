import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXPlaylistListItemComponent } from './playlist-list-item.component';
import { SCNGXArtworkModule, SCNGXNavListItemModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    SCNGXPlaylistListItemComponent
  ],
  imports: [
    CommonModule,

    SCNGXArtworkModule,
    SCNGXNavListItemModule
  ],
  exports: [
    SCNGXPlaylistListItemComponent
  ]
})
export class SCNGXPlaylistListItemModule { }
