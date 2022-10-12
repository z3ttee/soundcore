import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { HeroIconModule, play, heart, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SCNGXSkeletonModule, SCNGXSongListItemModule, SCNGXVirtualSongListModule, SCNGXVirtualPlaylistModule } from '@soundcore/ngx';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';

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
    HeroIconModule.withIcons({ play, heart, dotsVertical }),
    MatRippleModule,

    VirtualScrollerModule,

    ListViewModule,
    
    SCNGXSkeletonModule,
    SCNGXSongListItemModule,

    // SCNGXVirtualSongListModule,
    SCNGXVirtualPlaylistModule
  ]
})
export class PlaylistModule { }
