import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { RouterModule, Routes } from '@angular/router';
import { TeleportModule } from '@ngneat/overview';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SongModule } from '../song/song.module';
import { GenreGridItemComponent } from 'src/app/components/grid-items/genre-grid-item/genre-grid-item.component';
import { ArtistGridItemComponent } from 'src/app/components/grid-items/artist-grid-item/artist-grid-item.component';
import { StreamModule } from '../stream/stream.module';
import { AlbumGridItemComponent } from 'src/app/components/grid-items/album-grid-item/album-grid-item.component';
import { HorizontalGridComponent } from 'src/app/components/grids/horizontal-grid/horizontal-grid.component';
import { LabelGridItemComponent } from 'src/app/components/grid-items/label-grid-item/label-grid-item.component';
import { BestMatchComponent } from './components/best-match/best-match.component';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  { path: "", component: SearchIndexComponent }
]

@NgModule({
  declarations: [
    SearchIndexComponent,
    BestMatchComponent,

    GenreGridItemComponent,
    ArtistGridItemComponent,
    AlbumGridItemComponent,
    HorizontalGridComponent,
    LabelGridItemComponent,
    BestMatchComponent
  ],
  imports: [
    CommonModule,
    TeleportModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,

    SongModule,
    StreamModule,
    PipesModule,

    MatProgressBarModule
  ]
})
export class SearchModule { }
