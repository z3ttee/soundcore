import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { SCNGXArtistGridItemModule, SCNGXInfiniteListModule, SCNGXToolbarModule, SCNGXUiRowModule } from 'soundcore-ngx';
import { SCNGXHorizontalGridModule } from 'soundcore-ngx';
import { SCNGXAlbumGridItemModule } from 'soundcore-ngx';
import { SCNGXPlaylistGridItemModule } from 'soundcore-ngx';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SCDKAlbumModule, SCDKArtistModule, SCDKUserModule } from 'soundcore-sdk';
import { SCNGXProfileGridItemModule } from 'projects/soundcore-ngx/src/lib/components/grid/profile-grid-item/profile-grid-item.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';

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

    SongContextMenuModule
  ]
})
export class SearchModule { }
