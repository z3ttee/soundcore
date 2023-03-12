import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BucketListItemComponent } from './bucket-list-item.component';
import { SCNGXBytesPipeModule, SCNGXSkeletonModule } from '@soundcore/ngx';
import { NgIconsModule } from '@ng-icons/core';
import { heroRectangleStack, heroChartPie } from '@ng-icons/heroicons/outline';

@NgModule({
  declarations: [
    BucketListItemComponent
  ],
  imports: [
    CommonModule,
    NgIconsModule.withIcons({ heroRectangleStack, heroChartPie }),

    SCNGXBytesPipeModule,
    SCNGXSkeletonModule
  ],
  exports: [
    BucketListItemComponent
  ]
})
export class BucketListItemModule { }
