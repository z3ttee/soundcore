import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistInfoComponent } from './views/artist-info/artist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { TopSongItemComponent } from './components/top-song-item/top-song-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';
import { AscImageModule } from 'src/app/components/image-components/image-components.module';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { AscGridsModule } from 'src/app/components/grids/grids.module';
import { AscAlbumModule } from 'src/app/components/album-components/album-components.module';
import { ArtistCollectionComponent } from './views/artist-collection/artist-collection.component';
import { ArtistGenresComponent } from './views/artist-genres/artist-genres.component';
import { AscGenreModule } from 'src/app/components/genre-components/genre-components.module';
import { ArtistGenresInfoComponent } from './views/artist-genres-info/artist-genres-info.component';
import { ArtistSongsComponent } from './views/artist-songs/artist-songs.component';
import { ArtistAlbumsComponent } from './views/artist-albums/artist-albums.component';
import { ArtistFeaturedComponent } from './views/artist-featuring/artist-feat.component';
import { AscPlaylistViewModule } from 'src/app/components/views/playlist-view.module';
import { AscPlayableListModule } from 'src/app/components/lists/playable-list/playable-list.module';

const routes: Routes = [
  { path: ":artistId", component: ArtistInfoComponent },
  { path: ":artistId/collection", component: ArtistCollectionComponent },
  { path: ":artistId/genres", component: ArtistGenresComponent },
  { path: ":artistId/genres/:genreId", component: ArtistGenresInfoComponent },
  { path: ":artistId/songs", component: ArtistSongsComponent },
  { path: ":artistId/albums", component: ArtistAlbumsComponent },
  { path: ":artistId/featuring", component: ArtistFeaturedComponent }

]

@NgModule({
  declarations: [
    ArtistInfoComponent,
    TopSongItemComponent,
    ArtistCollectionComponent,
    ArtistGenresComponent,
    ArtistGenresInfoComponent,
    ArtistSongsComponent,
    ArtistAlbumsComponent,
    ArtistFeaturedComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PipesModule,

    AscSongModule,
    AscImageModule,
    AscBadgeModule,
    AscGridsModule,
    AscAlbumModule,
    AscGenreModule,
    AscPlaylistViewModule,
    AscPlayableListModule,

    MatProgressBarModule,
    MatButtonModule
  ]
})
export class ArtistModule { }
