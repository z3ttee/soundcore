import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { SCNGXArtworkModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule } from '@repo/angular-ui';
import { ListViewComponent } from './list-view.component';

@NgModule({
  declarations: [
    ListViewComponent
  ],
  imports: [
    CommonModule,
    MatRippleModule,

    SCNGXSkeletonModule,
    SCNGXArtworkModule,
    SCNGXSongDurationPipeModule
  ],
  exports: [
    ListViewComponent
  ]
})
export class ListViewModule { }
