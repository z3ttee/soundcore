import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BucketListItemComponent } from './bucket-list-item.component';
import { chartPie, collection, HeroIconModule } from 'ng-heroicon';
import { SCNGXBytesPipeModule, SCNGXSkeletonModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    BucketListItemComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ collection, chartPie }),

    SCNGXBytesPipeModule,
    SCNGXSkeletonModule
  ],
  exports: [
    BucketListItemComponent
  ]
})
export class BucketListItemModule { }
