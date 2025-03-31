import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCNGXArtworkModule, SCNGXResourceTypePipeModule } from '@repo/angular-ui';
import { GenericResourceListItemComponent } from './generic-resource-list-item.component';

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
