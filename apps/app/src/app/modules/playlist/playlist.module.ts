import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SCNGXButtonModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXTableModule } from '@soundcore/ngx';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { SCSDKPlaylistModule, SCSDKSongModule } from '@soundcore/sdk';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlaySolid, heroEllipsisVerticalSolid } from '@ng-icons/heroicons/solid';
import { heroHeart } from '@ng-icons/heroicons/outline';
import { SongListModule } from 'src/app/components/lists/song-list/song-list.module';

const routes: Routes = [
  { path: ":playlistId", component: PlaylistInfoComponent }
]

@NgModule({
  declarations: [
    PlaylistInfoComponent
  ],
  imports: [
    ScrollingModule,
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module,
    NgIconsModule.withIcons({ heroPlaySolid, heroHeart, heroEllipsisVerticalSolid }),
    MatRippleModule,
    ListViewModule,

    SCSDKPlaylistModule,
    SCSDKSongModule,
    
    SCNGXSkeletonModule,
    SCNGXTableModule,
    SCNGXButtonModule,
    SCNGXIconBtnModule,
    SCNGXSongDurationPipeModule,
    SCNGXSongListItemModule,
    SCNGXScrollingModule,

    SongContextMenuModule,
    SongListModule
  ]
})
export class PlaylistModule {}
