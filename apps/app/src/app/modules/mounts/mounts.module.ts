import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MountInfoComponent } from './views/mount-info/mount-info.component';
import { SCDKFileModule, SCSDKMountModule } from '@soundcore/sdk';
import { SCNGXButtonModule, SCNGXBytesPipeModule, SCNGXIconBtnModule, SCNGXLoadingBtnModule, SCNGXMountStatusPipeModule, SCNGXProgressbarModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXStatusIndicatorModule, SCNGXUiTitleModule } from '@soundcore/ngx';
import { chartPie, collection, HeroIconModule, pencil, plus, refresh, star, trash } from 'ng-heroicon';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXFileListItemModule } from 'src/app/components/list-items/file-list-item/file-list-item.module';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { AppMountCreateDialogModule } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SCNGXTabsModule } from 'src/app/components/navigation-tabs';

const routes: Routes = [
  { path: "", component: MountInfoComponent },
]

@NgModule({
  declarations: [
    MountInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeroIconModule.withIcons({ collection, chartPie, plus, refresh, star, trash, pencil }),
    Error404Module,
    VirtualScrollerModule,

    SCSDKMountModule,
    SCDKFileModule,

    SCNGXButtonModule,
    SCNGXLoadingBtnModule,
    SCNGXSkeletonModule,
    SCNGXBytesPipeModule,
    SCNGXStatusIndicatorModule,
    SCNGXMountStatusPipeModule,
    SCNGXUiTitleModule,
    SCNGXScrollingModule,
    SCNGXTabsModule,
    SCNGXIconBtnModule,
    SCNGXFileListItemModule,
    SCNGXProgressbarModule,

    AppMountCreateDialogModule,

    MatSnackBarModule,
  ]
})
export class MountsModule { }
