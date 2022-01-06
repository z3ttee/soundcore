import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { RouterModule, Routes } from '@angular/router';
import { TeleportModule } from '@ngneat/overview';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SongModule } from '../song/song.module';

const routes: Routes = [
  { path: "", component: SearchIndexComponent }
]

@NgModule({
  declarations: [
    SearchIndexComponent
  ],
  imports: [
    CommonModule,
    TeleportModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,

    SongModule,

    MatProgressBarModule
  ]
})
export class SearchModule { }
