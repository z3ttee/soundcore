import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXResourceGridItemModule } from '../resource-grid-item/resource-grid-item.module';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';
import { SCDKProfileGridItemComponent } from './profile-grid-item.component';

@NgModule({
  declarations: [
    SCDKProfileGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXResourceGridItemModule,
    SCNGXArtworkModule
  ],
  exports: [
    SCDKProfileGridItemComponent
  ]
})
export class SCNGXProfileGridItemModule { }
