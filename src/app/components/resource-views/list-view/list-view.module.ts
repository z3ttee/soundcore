import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListViewComponent } from './list-view.component';
import { SCNGXScreenModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXArtworkModule } from 'soundcore-ngx';
import { MatRippleModule } from '@angular/material/core';
import { HeroIconModule, heart, dotsVertical } from 'ng-heroicon';

@NgModule({
  declarations: [
    ListViewComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule,
    HeroIconModule.withIcons({ heart, dotsVertical }),

    SCNGXScreenModule,
    SCNGXSkeletonModule,
    SCNGXArtworkModule,
    SCNGXSongDurationPipeModule
  ],
  exports: [
    ListViewComponent
  ]
})
export class ListViewModule { }
