import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXResourceGridItemModule } from '../resource-grid-item/resource-grid-item.module';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';
import { SCDKPlaylistGridItemComponent } from './playlist-grid-item.component';

@NgModule({
  declarations: [
    SCDKPlaylistGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXResourceGridItemModule,
    SCNGXArtworkModule
  ],
  exports: [
    SCDKPlaylistGridItemComponent
  ]
})
export class SCNGXPlaylistGridItemModule { }
