import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SCNGXCollectionGridItemModule, SCNGXPlaylistGridItemModule, SCNGXResourceGridItemModule, SCNGXTabbarModule, SCNGXToolbarModule, SCNGXVerticalGridModule } from '@repo/angular-ui';
import { SCDKAlbumModule } from '@repo/angular-sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { LibraryAlbumsComponent } from './views/library-albums/library-albums.component';
import { LibraryArtistsComponent } from './views/library-artists/library-artists.component';
import { LibraryIndexComponent } from './views/library-index/library-index.component';
import { LibraryPlaylistsComponent } from './views/library-playlists/library-playlists.component';

const routes: Routes = [
  {
    path: "", component: LibraryIndexComponent, children: [
      { path: "", component: LibraryPlaylistsComponent },
      { path: "albums", component: LibraryAlbumsComponent },
      { path: "artists", component: LibraryArtistsComponent },
      { path: "**", redirectTo: "" }
    ]
  },
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
