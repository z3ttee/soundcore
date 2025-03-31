import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { heroChartPie, heroRectangleStack, heroStar } from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { SCNGXBytesPipeModule, SCNGXMountStatusPipeModule, SCNGXSkeletonModule } from '@repo/angular-components';
import { MountListItemComponent } from './mount-list-item.component';

@NgModule({
  declarations: [
    MountListItemComponent
  ],
  imports: [
    CommonModule,
    NgIconsModule.withIcons({ heroRectangleStack, heroChartPie, heroStar, heroStarSolid }),

    SCNGXBytesPipeModule,
    SCNGXMountStatusPipeModule,
    SCNGXSkeletonModule,
  ],
  exports: [
    MountListItemComponent
  ]
})
export class MountListItemModule { }
