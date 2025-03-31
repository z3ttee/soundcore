import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { heroChevronLeftSolid, heroChevronRightSolid } from '@ng-icons/heroicons/solid';
import { SCNGXHorizontalListComponent } from './horizontal-list.component';

@NgModule({
  declarations: [
    SCNGXHorizontalListComponent
  ],
  imports: [
    NgIconsModule.withIcons({
      heroChevronLeftSolid,
      heroChevronRightSolid,
    }),
    CommonModule,
    ScrollingModule
  ],
  exports: [
    SCNGXHorizontalListComponent
  ]
})
export class SCNGXHorizontalListModule { }
