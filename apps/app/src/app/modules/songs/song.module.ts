import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgIconsModule } from '@ng-icons/core';
import { heroHeart } from '@ng-icons/heroicons/outline';
import { SCNGXIconBtnModule } from "@repo/angular-components";
import { SCSDKSongModule } from "@repo/angular-sdk";
import { SCNGXSongListItemModule } from "src/app/components/list-items/song-list-item/song-list-item.module";
import { ListViewModule } from "src/app/components/resource-views/list-view/list-view.module";
import { Error404Module } from "src/app/shared/error404/error404.module";
import { SongInfoViewComponent } from "./views/song-info/song-info.component";

const routes: Routes = [
    { path: ":songId", component: SongInfoViewComponent }
]

@NgModule({
    declarations: [
        SongInfoViewComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgIconsModule.withIcons({ heroHeart }),

        Error404Module,
        ListViewModule,

        SCSDKSongModule,

        SCNGXIconBtnModule,
        SCNGXSongListItemModule
    ]
})
export class SongModule { }