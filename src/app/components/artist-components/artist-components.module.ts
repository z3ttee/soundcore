import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistGridItemComponent } from './artist-grid-item/artist-grid-item.component';
import { AscImageModule } from '../image-components/image-components.module';

@NgModule({
  declarations: [
    ArtistGridItemComponent
  ],
  imports: [
    CommonModule,
    AscImageModule
  ],
  exports: [
    ArtistGridItemComponent
  ]
})
export class AscArtistModule { }
