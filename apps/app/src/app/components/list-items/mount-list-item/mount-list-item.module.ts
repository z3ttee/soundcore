import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MountListItemComponent } from './mount-list-item.component';
import { SCNGXMountStatusPipeModule, SCNGXBytesPipeModule, SCNGXSkeletonModule } from '@soundcore/ngx';
import { NgIconsModule } from '@ng-icons/core';
import { heroRectangleStack, heroChartPie, heroStar } from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

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
