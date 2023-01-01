import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXHorizontalListComponent } from './horizontal-list.component';
import { HeroIconModule, chevronRight } from 'ng-heroicon';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    SCNGXHorizontalListComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ chevronRight }),

    ScrollingModule
  ],
  exports: [
    SCNGXHorizontalListComponent
  ]
})
export class SCNGXHorizontalListModule { }
