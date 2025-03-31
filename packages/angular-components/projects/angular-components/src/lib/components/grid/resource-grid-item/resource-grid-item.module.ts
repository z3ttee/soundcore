import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXResourceGridItemComponent } from './resource-grid-item.component';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';

@NgModule({
  declarations: [
    SCNGXResourceGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXArtworkModule
  ],
  exports: [
    SCNGXResourceGridItemComponent
  ]
})
export class SCNGXResourceGridItemModule { }
