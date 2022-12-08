import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { SCNGXArtistGridItemModule, SCNGXInfiniteListModule, SCNGXToolbarModule, SCNGXUiRowModule, SCNGXHorizontalGridModule, SCNGXAlbumGridItemModule, SCNGXPlaylistGridItemModule, SCNGXProfileGridItemModule } from '@soundcore/ngx';

import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SCDKAlbumModule, SCDKArtistModule, SCDKUserModule, SCSDKPlaylistModule, SCSDKSongModule } from '@soundcore/sdk';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';
import { SongGridItemModule } from 'src/app/components/grid-items/song-grid-item/song-grid-item.module';

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

    SCNGXToolbarModule,
    SCNGXUiRowModule,
    SCNGXHorizontalGridModule,
    SCNGXAlbumGridItemModule,
    SCNGXPlaylistGridItemModule,
    SCNGXArtistGridItemModule,
    SCNGXProfileGridItemModule,
    SCNGXInfiniteListModule,

    SCDKUserModule,
    SCDKArtistModule,
    SCDKAlbumModule,

    SCSDKPlaylistModule,
    SCSDKSongModule,

    SongGridItemModule,
    SongContextMenuModule
  ]
})
export class SearchModule { }
