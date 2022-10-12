import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXPlaylistListItemComponent } from './playlist-list-item.component';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';
import { SCNGXNavListItemModule } from '../nav-list-item/nav-list-item.module';


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
