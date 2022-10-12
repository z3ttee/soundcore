import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MountListItemComponent } from './mount-list-item.component';
import { chartPie, collection, HeroIconModule } from 'ng-heroicon';
import { SCNGXMountStatusPipeModule, SCNGXBytesPipeModule, SCNGXStatusIndicatorModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    MountListItemComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ collection, chartPie }),

    SCNGXBytesPipeModule,
    SCNGXMountStatusPipeModule,
    SCNGXStatusIndicatorModule
  ],
  exports: [
    MountListItemComponent
  ]
})
export class MountListItemModule { }
