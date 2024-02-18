import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { SCNGXArtistGridItemModule, SCNGXToolbarModule, SCNGXUiRowModule, SCNGXAlbumGridItemModule, SCNGXPlaylistGridItemModule, SCNGXProfileGridItemModule, SCNGXHorizontalListModule } from '@soundcore/ngx';

import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SCDKAlbumModule, SCDKUserModule, SCSDKArtistModule, SCSDKPlaylistModule, SCSDKSearchModule, SCSDKSongModule } from '@soundcore/sdk';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { SongGridItemModule } from 'src/app/components/grid-items/song-grid-item/song-grid-item.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Routes = [
  { path: "", component: SearchIndexComponent }
]

@NgModule({
  declarations: [
    SearchIndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    Error404Module,

    MatSnackBarModule,

    SCNGXToolbarModule,
    SCNGXUiRowModule,
    SCNGXAlbumGridItemModule,
    SCNGXPlaylistGridItemModule,
    SCNGXArtistGridItemModule,
    SCNGXProfileGridItemModule,
    SCNGXHorizontalListModule,

    SCDKUserModule,
    SCDKAlbumModule,

    SCSDKArtistModule,
    SCSDKPlaylistModule,
    SCSDKSongModule,
    SCSDKSearchModule,

    SongGridItemModule,
    SongContextMenuModule
  ]
})
export class SearchModule { }
