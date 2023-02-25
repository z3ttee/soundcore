import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListViewComponent } from './list-view.component';
import { SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXArtworkModule } from '@soundcore/ngx';
import { MatRippleModule } from '@angular/material/core';

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
