import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryIndexComponent } from './views/library-index/library-index.component';
import { RouterModule, Routes } from '@angular/router';
import { LibraryPlaylistsComponent } from './views/library-playlists/library-playlists.component';
import { LibraryAlbumsComponent } from './views/library-albums/library-albums.component';
import { LibraryArtistsComponent } from './views/library-artists/library-artists.component';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXCollectionGridItemModule, SCNGXPlaylistGridItemModule, SCNGXResourceGridItemModule, SCNGXTabbarModule, SCNGXToolbarModule, SCNGXVerticalGridModule } from 'soundcore-ngx';
import { SCDKAlbumModule } from '@soundcore/sdk';

const routes: Routes = [
  { path: "", component: LibraryIndexComponent, children: [
    { path: "", component: LibraryPlaylistsComponent },
    { path: "albums", component: LibraryAlbumsComponent },
    { path: "artists", component: LibraryArtistsComponent },
    { path: "**", redirectTo: "" }
  ]},
]

@NgModule({
  declarations: [
    LibraryIndexComponent,
    LibraryPlaylistsComponent,
    LibraryAlbumsComponent,
    LibraryArtistsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module,

    SCNGXTabbarModule,
    SCNGXToolbarModule,
    SCNGXResourceGridItemModule,
    SCNGXCollectionGridItemModule,
    SCNGXPlaylistGridItemModule,
    SCNGXVerticalGridModule,

    SCDKAlbumModule
  ]
})
export class LibraryModule { }
