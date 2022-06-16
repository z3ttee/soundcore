import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { chartPie, collection, HeroIconModule } from 'ng-heroicon';
import { SCNGXBucketFlagPipeModule, SCNGXBytesPipeModule } from 'soundcore-ngx';
import { FileListItemComponent } from './file-list-item.component';

@NgModule({
  declarations: [
    FileListItemComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ collection, chartPie }),

    SCNGXBytesPipeModule,
    SCNGXBucketFlagPipeModule
  ],
  exports: [
    FileListItemComponent
  ]
})
export class FileListItemModule { }
