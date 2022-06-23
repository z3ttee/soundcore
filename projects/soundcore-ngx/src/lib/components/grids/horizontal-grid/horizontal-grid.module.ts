import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXHorizontalGridComponent } from './horizontal-grid.component';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { HeroIconModule, chevronRight } from 'ng-heroicon';

@NgModule({
  declarations: [
    SCNGXHorizontalGridComponent
  ],
  imports: [
    CommonModule,
    VirtualScrollerModule,
    HeroIconModule.withIcons({ chevronRight })
  ],
  exports: [
    SCNGXHorizontalGridComponent
  ]
})
export class SCNGXHorizontalGridModule { }
