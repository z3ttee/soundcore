import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXCollectionGridItemComponent } from './collection-grid-item.component';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';

@NgModule({
  declarations: [
    SCNGXCollectionGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXArtworkModule
  ],
  exports: [
    SCNGXCollectionGridItemComponent
  ]
})
export class SCNGXCollectionGridItemModule { }
