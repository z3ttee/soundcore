import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXCollectionGridItemComponent } from './collection-grid-item.component';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';
import { SCNGXBulletListModule } from '../../list/bullet-list/bullet-list.module';

@NgModule({
  declarations: [
    SCNGXCollectionGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXArtworkModule,
    SCNGXBulletListModule
  ],
  exports: [
    SCNGXCollectionGridItemComponent
  ]
})
export class SCNGXCollectionGridItemModule { }
