import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXInfiniteListComponent } from './infinite-list.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

@NgModule({
  declarations: [
    SCNGXInfiniteListComponent
  ],
  imports: [
    CommonModule,
    VirtualScrollerModule
  ],
  exports: [
    SCNGXInfiniteListComponent
  ]
})
export class SCNGXInfiniteListModule { }
