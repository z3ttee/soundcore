import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { HeroIconModule, play, heart, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SCNGXButtonModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXTableModule } from '@soundcore/ngx';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';
import { SCSDKPlaylistModule } from '@soundcore/sdk';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';

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
    FontAwesomeModule,

    VirtualScrollerModule,

    ListViewModule,

    SCSDKPlaylistModule,
    
    SCNGXSkeletonModule,
    SCNGXTableModule,
    SCNGXButtonModule,
    SCNGXIconBtnModule,
    SCNGXSongDurationPipeModule,
    SCNGXSongListItemModule,
    SCNGXScrollingModule
  ]
})
export class PlaylistModule {
  constructor(faLibrary: FaIconLibrary) {
    faLibrary.addIcons(faPlay)
  }
}
