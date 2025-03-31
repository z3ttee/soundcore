import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXAlbumGridItemComponent } from './album-grid-item.component';
import { SCNGXResourceGridItemModule } from '../resource-grid-item/resource-grid-item.module';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';

@NgModule({
  declarations: [
    SCNGXAlbumGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXResourceGridItemModule,
    SCNGXArtworkModule
  ],
  exports: [
    SCNGXAlbumGridItemComponent
  ]
})
export class SCNGXAlbumGridItemModule { }
