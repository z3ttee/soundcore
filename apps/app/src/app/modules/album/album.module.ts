import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumInfoComponent } from './views/album-info/album-info.component';
import { RouterModule, Routes } from '@angular/router';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { SCDKAlbumModule, SCSDKTracklistModule } from '@soundcore/sdk';
import { SCNGXAlbumGridItemModule, SCNGXArtworkModule, SCNGXButtonModule, SCNGXHorizontalListModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXSongDurationPipeModule, SCNGXTableModule, SCNGXUiRowModule } from '@soundcore/ngx';
import { MatRippleModule } from '@angular/material/core';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { Error404Component } from 'src/app/shared/error404/error404.component';
import { NgIconsModule } from '@ng-icons/core';
import { heroEllipsisVerticalSolid } from '@ng-icons/heroicons/solid';
import { heroHeart } from '@ng-icons/heroicons/outline';
import { AppPlayerModule } from '../player/player.module';

const routes: Routes = [
  { path: ":albumId", component: AlbumInfoComponent },
  { path: "**", component: Error404Component}
]

@NgModule({
  declarations: [
    AlbumInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListViewModule,
    NgIconsModule.withIcons({ heroHeart, heroEllipsisVerticalSolid }),
    AppPlayerModule,

    ListViewModule,
    SongContextMenuModule,

    MatRippleModule,

    SCDKAlbumModule,
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

    Error404Module
  ]
})
export class AlbumModule { }
