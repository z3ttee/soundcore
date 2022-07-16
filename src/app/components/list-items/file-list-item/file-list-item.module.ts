import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { chartPie, HeroIconModule } from 'ng-heroicon';
import { SCNGXBytesPipeModule, SCNGXFileFlagPipeModule, SCNGXStatusIndicatorModule } from 'soundcore-ngx';
import { FileListItemComponent } from './file-list-item.component';

@NgModule({
  declarations: [
    FileListItemComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ chartPie }),

    SCNGXBytesPipeModule,
    SCNGXFileFlagPipeModule,
    SCNGXStatusIndicatorModule
  ],
  exports: [
    FileListItemComponent
  ]
})
export class FileListItemModule { }
