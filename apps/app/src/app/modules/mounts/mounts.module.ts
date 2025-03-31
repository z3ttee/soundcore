import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Routes } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroArrowPath, heroChartPie, heroPencil, heroRectangleStack, heroStar, heroTrash } from '@ng-icons/heroicons/outline';
import { heroPlusSolid, heroStarSolid } from '@ng-icons/heroicons/solid';
import { SCNGXButtonModule, SCNGXBytesPipeModule, SCNGXIconBtnModule, SCNGXLoadingBtnModule, SCNGXMountStatusPipeModule, SCNGXProgressbarModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXStatusIndicatorModule, SCNGXUiTitleModule } from '@repo/angular-components';
import { SCDKFileModule, SCSDKMountModule } from '@repo/angular-sdk';
import { SCNGXFileListItemModule } from 'src/app/components/list-items/file-list-item/file-list-item.module';
import { SCNGXTabsModule } from 'src/app/components/navigation-tabs';
import { AppMountCreateDialogModule } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.module';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { MountInfoComponent } from './views/mount-info/mount-info.component';

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
