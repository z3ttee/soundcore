import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistProfileComponent } from './views/artist-profile/artist-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { SCDKAlbumModule, SCDKArtistModule } from '@soundcore/sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ListViewModule } from "src/app/components/resource-views/list-view/list-view.module";
import { HeroIconModule, dotsVertical } from 'ng-heroicon';
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
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisV, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { LottieModule } from 'ngx-lottie';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';

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
    HeroIconModule.withIcons({ dotsVertical }),
    FontAwesomeModule,
    LottieModule,

    MatRippleModule,

    ListViewModule,
    SongContextMenuModule,

    SCDKArtistModule,
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
    SCNGXTableModule,

    SCNGXSongListItemModule
  ]
})
export class ArtistModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faPlay, faPause, faEllipsisV);
  }
}
