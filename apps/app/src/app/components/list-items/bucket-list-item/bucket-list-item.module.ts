import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { heroChartPie, heroRectangleStack } from '@ng-icons/heroicons/outline';
import { SCNGXBytesPipeModule, SCNGXSkeletonModule } from '@repo/angular-ui';
import { BucketListItemComponent } from './bucket-list-item.component';

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
