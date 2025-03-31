import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SCNGXArtworkModule, SCNGXBytesPipeModule, SCNGXExplicitBadgeModule, SCNGXFileFlagPipeModule, SCNGXSkeletonModule, SCNGXStatusIndicatorModule } from '@repo/angular-ui';
import { SCNGXFileListItemComponent } from './file-list-item.component';

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
