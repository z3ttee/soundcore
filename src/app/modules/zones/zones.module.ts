import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ZonesIndexComponent } from './views/zones-index/zones-index.component';
import { SCDKBucketModule } from 'soundcore-sdk';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { chartPie, collection, HeroIconModule } from 'ng-heroicon';
import { SCNGXBucketFlagPipeModule, SCNGXBytesPipeModule } from 'soundcore-ngx';
import { ZoneInfoComponent } from './views/zone-info/zone-info.component';

const routes: Routes = [
  { path: "", component: ZonesIndexComponent },
  { path: ":zoneId", component: ZoneInfoComponent }
]

@NgModule({
  declarations: [
    ZonesIndexComponent,
    ZoneInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    VirtualScrollerModule,
    HeroIconModule.withIcons({ collection, chartPie }),

    SCDKBucketModule,
    
    SCNGXBucketFlagPipeModule,
    SCNGXBytesPipeModule
  ]
})
export class ZonesModule { }
