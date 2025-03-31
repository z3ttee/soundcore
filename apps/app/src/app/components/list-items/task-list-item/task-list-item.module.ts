import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroCalendarDays, heroChevronRight, heroClock } from '@ng-icons/heroicons/outline';
import { SCNGXSkeletonModule, SCNGXStatusIndicatorModule } from '@repo/angular-components';
import { SCNGXTaskStatusIconModule } from '../../icons/task-status-icon/task-status-icon.module';
import { SCNGXTaskListItemComponent } from './task-list-item.component';

@NgModule({
  declarations: [
    SCNGXTaskListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgIconsModule.withIcons({ heroChevronRight, heroCalendarDays, heroClock }),

    SCNGXSkeletonModule,
    SCNGXTaskStatusIconModule,
    SCNGXStatusIndicatorModule
  ],
  exports: [
    SCNGXTaskListItemComponent
  ]
})
export class SCNGXTaskListItemModule { }
