import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SongInfoComponent } from './views/song-info/song-info.component';
import { AscPlaylistViewModule } from 'src/app/components/views/playlist-view.module';

const routes: Routes = [
  { path: ":songId", component: SongInfoComponent }
]

@NgModule({
  declarations: [
    SongInfoComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule.forChild(routes),

    AscPlaylistViewModule
  ]
})
export class SongModule { }
