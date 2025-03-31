import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule, Routes } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroHeart } from '@ng-icons/heroicons/outline';
import { heroEllipsisVerticalSolid, heroPauseSolid, heroPlaySolid } from '@ng-icons/heroicons/solid';
import { SCNGXAlbumGridItemModule, SCNGXArtworkModule, SCNGXButtonModule, SCNGXHorizontalListModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXSongDurationPipeModule, SCNGXTableModule, SCNGXUiRowModule } from '@repo/angular-ui';
import { SCDKAlbumModule, SCSDKSongModule, SCSDKTracklistModule } from '@repo/angular-sdk';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { Error404Component } from 'src/app/shared/error404/error404.component';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { AlbumInfoComponent } from './views/album-info/album-info.component';

import { SongListModule } from 'src/app/components/lists/song-list/song-list.module';
import { AppPlayerModule } from '../player/player.module';

const routes: Routes = [
  { path: ":albumId", component: AlbumInfoComponent },
  { path: "**", component: Error404Component }
]

@NgModule({
  declarations: [
    AlbumInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListViewModule,
    NgIconsModule.withIcons({ heroHeart, heroEllipsisVerticalSolid, heroPauseSolid, heroPlaySolid }),
    AppPlayerModule,

    ListViewModule,
    SongContextMenuModule,

    MatRippleModule,

    SCDKAlbumModule,
    SCSDKSongModule,
    SCSDKTracklistModule,

    SCNGXSongDurationPipeModule,
    SCNGXHorizontalListModule,
    SCNGXUiRowModule,
    SCNGXAlbumGridItemModule,
    SCNGXTableModule,
    SCNGXIconBtnModule,
    SCNGXSongListItemModule,
    SCNGXArtworkModule,
    SCNGXScrollingModule,
    SCNGXButtonModule,

    Error404Module,
    SongListModule
  ]
})
export class AlbumModule { }
