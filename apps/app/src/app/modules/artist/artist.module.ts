import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistProfileComponent } from './views/artist-profile/artist-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { SCDKAlbumModule, SCSDKArtistModule, SCSDKSongModule } from '@soundcore/sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ListViewModule } from "src/app/components/resource-views/list-view/list-view.module";
import { MatRippleModule } from '@angular/material/core';
import { 
  SCNGXSkeletonModule, 
  SCNGXUiRowModule, 
  SCNGXAlbumGridItemModule, 
  SCNGXPlaylistGridItemModule,
  SCNGXTableModule, 
  SCNGXIconBtnModule, 
  SCNGXUiSectionTitleModule, 
  SCNGXUiTitleModule, 
  SCNGXArtworkModule,
  SCNGXScrollingModule,
  SCNGXButtonModule,
  SCNGXHorizontalListModule
} from '@soundcore/ngx';
import { ArtistSongsComponent } from './views/artist-songs/artist-songs.component';
import { SCNGXChipsModule } from 'src/app/components/chips/chips.module';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { LottieModule } from 'ngx-lottie';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { NgIconsModule } from '@ng-icons/core';
import { heroEllipsisVerticalSolid } from '@ng-icons/heroicons/solid';
import { heroHeart, heroMusicalNote } from '@ng-icons/heroicons/outline';
import { SongListModule } from 'src/app/components/lists/song-list/song-list.module';

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
    LottieModule,

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
export class ArtistModule {}
