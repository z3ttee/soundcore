import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { heroChartPie, heroRectangleStack } from '@ng-icons/heroicons/outline';
import { heroPlusSolid } from '@ng-icons/heroicons/solid';
import { SCSDKMountModule, SCSDKZoneModule } from '@repo/angular-sdk';
import { SCNGXButtonModule, SCNGXBytesPipeModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXUiSectionTitleModule, SCNGXUiTitleModule, SCNGXZoneStatusPipeModule } from '@repo/angular-ui';
import { BucketListItemModule } from 'src/app/components/list-items/bucket-list-item/bucket-list-item.module';
import { MountListItemModule } from 'src/app/components/list-items/mount-list-item/mount-list-item.module';
import { AppMountCreateDialogModule } from 'src/app/dialogs/mount-create-dialog/mount-create-dialog.module';
import { Error404Module } from 'src/app/shared/error404/error404.module';

@NgModule({

  imports: [
    CommonModule,
    NgIconsModule.withIcons({ heroRectangleStack, heroChartPie, heroPlusSolid }),

    SCSDKZoneModule,
    SCSDKMountModule,

    SCNGXSkeletonModule,
    SCNGXBytesPipeModule,
    SCNGXZoneStatusPipeModule,
    SCNGXUiTitleModule,
    SCNGXUiSectionTitleModule,
    SCNGXButtonModule,
    SCNGXScrollingModule,

    BucketListItemModule,
    MountListItemModule,

    AppMountCreateDialogModule,
    Error404Module
  ]
})
export class ZonesModule { }
