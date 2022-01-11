import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreInfoComponent } from './views/genre-info/genre-info.component';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppCommonModule } from 'src/app/common.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SongModule } from '../song/song.module';

const routes: Routes = [
  { path: ":genreId", component: GenreInfoComponent }
]

@NgModule({
  declarations: [
    GenreInfoComponent
  ],
  imports: [
    // TODO
    SongModule,

    CommonModule,
    AppCommonModule,
    RouterModule.forChild(routes),

    MatProgressBarModule,
    MatPaginatorModule
  ]
})
export class GenreModule { }
