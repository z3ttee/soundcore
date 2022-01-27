import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { RouterModule, Routes } from '@angular/router';
import { TeleportModule } from '@ngneat/overview';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GenreGridItemComponent } from 'src/app/components/grid-items/genre-grid-item/genre-grid-item.component';
import { StreamModule } from '../stream/stream.module';
import { BestMatchComponent } from './components/best-match/best-match.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SearchService } from './services/search.service';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { AscGridsModule } from 'src/app/components/grids/grids.module';
import { AscAlbumModule } from 'src/app/components/album-components/album-components.module';
import { AscArtistModule } from 'src/app/components/artist-components/artist-components.module';
import { AscLabelModule } from 'src/app/components/label-components/label-components.module';
import { AscUserModule } from 'src/app/components/user-components/user-components.module';

const routes: Routes = [
  { path: "", component: SearchIndexComponent }
]

@NgModule({
  declarations: [
    SearchIndexComponent,
    BestMatchComponent,

    GenreGridItemComponent,
    BestMatchComponent
  ],
  imports: [
    CommonModule,
    TeleportModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,

    StreamModule,
    PipesModule,
    AscSongModule,
    AscBadgeModule,
    AscGridsModule,
    AscAlbumModule,
    AscArtistModule,
    AscLabelModule,
    AscUserModule,

    MatProgressBarModule
  ],
  providers: [
    SearchService
  ]
})
export class SearchModule { }
