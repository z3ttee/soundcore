import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXVirtualSongListComponent } from './virtual-song-list.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SCNGXSongListItemModule } from '../song-list-item/song-list-item.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { HeroIconModule, informationCircle } from 'ng-heroicon';

@NgModule({
  declarations: [
    SCNGXVirtualSongListComponent
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    VirtualScrollerModule,
    HeroIconModule.withIcons({ informationCircle }),

    SCNGXSongListItemModule
  ],
  exports: [
    SCNGXVirtualSongListComponent,
    SCNGXSongListItemModule
  ]
})
export class SCNGXVirtualSongListModule { }