import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SCNGXAlbumGridItemModule, SCNGXArtistGridItemModule, SCNGXHorizontalListModule, SCNGXPlaylistGridItemModule, SCNGXProfileGridItemModule, SCNGXToolbarModule, SCNGXUiRowModule } from '@repo/angular-components';
import { SearchIndexComponent } from './views/search-index/search-index.component';

import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SCDKAlbumModule, SCDKUserModule, SCSDKArtistModule, SCSDKPlaylistModule, SCSDKSearchModule, SCSDKSongModule } from '@repo/angular-sdk';
import { SongGridItemModule } from 'src/app/components/grid-items/song-grid-item/song-grid-item.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { Error404Module } from 'src/app/shared/error404/error404.module';

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
