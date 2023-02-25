import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MountInfoComponent } from './views/mount-info/mount-info.component';
import { SCDKFileModule, SCSDKMountModule } from '@soundcore/sdk';
import { SCNGXButtonModule, SCNGXBytesPipeModule, SCNGXIconBtnModule, SCNGXLoadingBtnModule, SCNGXMountStatusPipeModule, SCNGXProgressbarModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXStatusIndicatorModule, SCNGXUiTitleModule } from '@soundcore/ngx';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXFileListItemModule } from 'src/app/components/list-items/file-list-item/file-list-item.module';
import { AppMountCreateDialogModule } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SCNGXTabsModule } from 'src/app/components/navigation-tabs';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlusSolid, heroStarSolid } from '@ng-icons/heroicons/solid';
import { heroRectangleStack, heroChartPie, heroPencil, heroTrash, heroArrowPath, heroStar } from '@ng-icons/heroicons/outline';

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
    NgIconsModule.withIcons({ heroRectangleStack, heroChartPie, heroPlusSolid, heroArrowPath, heroStar, heroStarSolid, heroTrash, heroPencil }),
    Error404Module,

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
