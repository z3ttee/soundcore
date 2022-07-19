import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericResourceListItemComponent } from './generic-resource-list-item.component';
import { SCNGXArtworkModule, SCNGXResourceTypePipeModule } from 'soundcore-ngx';

@NgModule({
  declarations: [
    GenericResourceListItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXArtworkModule,
    SCNGXResourceTypePipeModule
  ],
  exports: [
    GenericResourceListItemComponent
  ]
})
export class GenericResourceListItemModule { }
