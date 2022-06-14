import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BucketListItemComponent } from './bucket-list-item.component';
import { chartPie, collection, HeroIconModule } from 'ng-heroicon';
import { SCNGXBucketFlagPipeModule, SCNGXBytesPipeModule } from 'soundcore-ngx';

@NgModule({
  declarations: [
    BucketListItemComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ collection, chartPie }),

    SCNGXBytesPipeModule,
    SCNGXBucketFlagPipeModule
  ],
  exports: [
    BucketListItemComponent
  ]
})
export class BucketListItemModule { }
