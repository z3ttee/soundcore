import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSkeletonModule, SCNGXStatusIndicatorModule } from '@soundcore/ngx';
import { SCNGXTaskListItemComponent } from './task-list-item.component';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroChevronRight, heroCalendarDays, heroClock } from '@ng-icons/heroicons/outline';
import { SCNGXTaskStatusIconModule } from '../../icons/task-status-icon/task-status-icon.module';

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
