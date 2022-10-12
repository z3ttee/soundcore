import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistProfileComponent } from './views/artist-profile/artist-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { SCDKAlbumModule, SCDKArtistModule } from '@soundcore/sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ListViewModule } from "src/app/components/resource-views/list-view/list-view.module";
import { HeroIconModule, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { SCNGXVirtualSongListModule, SCNGXSongListModule, SCNGXSkeletonModule, SCNGXUiRowModule, SCNGXAlbumGridItemModule, SCNGXHorizontalGridModule, SCNGXPlaylistGridItemModule } from 'soundcore-ngx';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';

const routes: Routes = [
  { path: ":artistId", component: ArtistProfileComponent },
  { path: "**", redirectTo: "/" }
]

@NgModule({
  declarations: [
    ArtistProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module,
    HeroIconModule.withIcons({ dotsVertical }),
    VirtualScrollerModule,

    MatRippleModule,

    ListViewModule,

    SCDKArtistModule,
    SCDKAlbumModule,

    SCNGXVirtualSongListModule,
    SCNGXHorizontalGridModule,
    SCNGXSongListModule,
    SCNGXSkeletonModule,
    SCNGXUiRowModule,
    SCNGXAlbumGridItemModule,
    SCNGXPlaylistGridItemModule
  ]
})
export class ArtistModule { }
