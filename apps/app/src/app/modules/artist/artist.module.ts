import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule, Routes } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroHeart, heroMusicalNote } from '@ng-icons/heroicons/outline';
import { heroEllipsisVerticalSolid } from '@ng-icons/heroicons/solid';
import { SCDKAlbumModule, SCSDKArtistModule, SCSDKSongModule } from '@repo/angular-sdk';
import {
  SCNGXAlbumGridItemModule,
  SCNGXArtworkModule,
  SCNGXButtonModule,
  SCNGXHorizontalListModule,
  SCNGXIconBtnModule,
  SCNGXPlaylistGridItemModule,
  SCNGXScrollingModule,
  SCNGXSkeletonModule,
  SCNGXUiRowModule,
  SCNGXUiSectionTitleModule,
  SCNGXUiTitleModule
} from '@repo/angular-ui';
import { LottieComponent } from 'ngx-lottie';
import { SCNGXChipsModule } from 'src/app/components/chips/chips.module';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { SongListModule } from 'src/app/components/lists/song-list/song-list.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { ListViewModule } from "src/app/components/resource-views/list-view/list-view.module";
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ArtistProfileComponent } from './views/artist-profile/artist-profile.component';
import { ArtistSongsComponent } from './views/artist-songs/artist-songs.component';

const routes: Routes = [
  { path: ":artistId", component: ArtistProfileComponent },
  { path: ":artistId/songs", component: ArtistSongsComponent },
  { path: "**", redirectTo: "/" }
]

@NgModule({
  declarations: [
    ArtistProfileComponent,
    ArtistSongsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module,
    NgIconsModule.withIcons({ heroEllipsisVerticalSolid, heroHeart, heroMusicalNote }),
    LottieComponent,

    MatRippleModule,

    ListViewModule,
    SongContextMenuModule,

    SCSDKArtistModule,
    SCSDKSongModule,
    SCDKAlbumModule,

    SCNGXHorizontalListModule,
    SCNGXSkeletonModule,
    SCNGXUiRowModule,
    SCNGXUiSectionTitleModule,
    SCNGXUiTitleModule,
    SCNGXAlbumGridItemModule,
    SCNGXPlaylistGridItemModule,
    SCNGXIconBtnModule,
    SCNGXButtonModule,
    SCNGXChipsModule,
    SCNGXArtworkModule,

    SCNGXScrollingModule,

    SCNGXSongListItemModule,
    SongListModule
  ]
})
export class ArtistModule { }
