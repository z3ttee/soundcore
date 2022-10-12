import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ZonesIndexComponent } from './views/zones-index/zones-index.component';
import { SCDKBucketModule, SCDKMountModule } from '@soundcore/sdk';
import { chartPie, collection, HeroIconModule, plus } from 'ng-heroicon';
import { SCNGXButtonModule, SCNGXBytesPipeModule, SCNGXInfiniteListModule, SCNGXSkeletonModule, SCNGXUiTitleModule } from '@soundcore/ngx';
import { ZoneInfoComponent } from './views/zone-info/zone-info.component';
import { BucketListItemModule } from 'src/app/components/list-items/bucket-list-item/bucket-list-item.module';
import { MountListItemModule } from 'src/app/components/list-items/mount-list-item/mount-list-item.module';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { AppMountCreateDialogModule } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.module';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SSOGuard } from '@soundcore/sso';

const routes: Routes = [
  { path: "", component: ZonesIndexComponent },
  { path: ":zoneId", component: ZoneInfoComponent },
  { path: ":zoneId/:mountId", canActivate: [SSOGuard], loadChildren: () => import("../mounts/mounts.module").then((m) => m.MountsModule) },
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
    HeroIconModule.withIcons({ collection, chartPie, plus }),

    SCDKBucketModule,
    SCDKMountModule,
    
    SCNGXSkeletonModule,
    SCNGXInfiniteListModule,
    SCNGXBytesPipeModule,
    SCNGXUiTitleModule,
    SCNGXButtonModule,

    BucketListItemModule,
    MountListItemModule,

    AppMountCreateDialogModule,
    Error404Module
  ]
})
export class ZonesModule { }
