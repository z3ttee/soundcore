import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtistGridItemComponent } from './artist-grid-item.component';
import { SCNGXResourceGridItemModule } from '../resource-grid-item/resource-grid-item.module';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';

@NgModule({
  declarations: [
    SCNGXArtistGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXResourceGridItemModule,
    SCNGXArtworkModule
  ],
  exports: [
    SCNGXArtistGridItemComponent
  ]
})
export class SCNGXArtistGridItemModule { }
