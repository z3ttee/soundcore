import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSkeletonModule, SCNGXStatusIndicatorModule, SCNGXTooltipModule } from '@soundcore/ngx';
import { SCNGXTaskListItemComponent } from './task-list-item.component';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroCheckCircle, heroQueueList, heroArrowPath, heroXCircle, heroExclamationTriangle, heroChevronRight, heroCalendarDays, heroClock } from '@ng-icons/heroicons/outline';

@NgModule({
  declarations: [
    SCNGXTaskListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgIconsModule.withIcons({ heroCheckCircle, heroQueueList, heroArrowPath, heroXCircle, heroExclamationTriangle, heroChevronRight, heroCalendarDays, heroClock }),

    SCNGXSkeletonModule,
    SCNGXStatusIndicatorModule
  ],
  exports: [
    SCNGXTaskListItemComponent
  ]
})
export class SCNGXTaskListItemModule { }
