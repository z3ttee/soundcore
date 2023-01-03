import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MountListItemComponent } from './mount-list-item.component';
import { chartPie, collection, HeroIconModule, star } from 'ng-heroicon';
import { SCNGXMountStatusPipeModule, SCNGXBytesPipeModule, SCNGXSkeletonModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    MountListItemComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ collection, chartPie, star }),

    SCNGXBytesPipeModule,
    SCNGXMountStatusPipeModule,
    SCNGXSkeletonModule,
  ],
  exports: [
    MountListItemComponent
  ]
})
export class MountListItemModule { }
