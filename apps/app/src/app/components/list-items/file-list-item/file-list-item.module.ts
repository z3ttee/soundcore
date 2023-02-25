import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtworkModule, SCNGXBytesPipeModule, SCNGXExplicitBadgeModule, SCNGXFileFlagPipeModule, SCNGXSkeletonModule, SCNGXStatusIndicatorModule } from '@soundcore/ngx';
import { SCNGXFileListItemComponent } from './file-list-item.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SCNGXFileListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    SCNGXSkeletonModule,
    SCNGXBytesPipeModule,
    SCNGXFileFlagPipeModule,
    SCNGXStatusIndicatorModule,
    SCNGXArtworkModule,
    SCNGXExplicitBadgeModule
  ],
  exports: [
    SCNGXFileListItemComponent
  ]
})
export class SCNGXFileListItemModule { }
