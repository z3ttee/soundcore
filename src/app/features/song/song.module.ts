import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SongInfoComponent } from './views/song-info/song-info.component';
import { AscPlaylistViewModule } from 'src/app/components/views/playlist-view.module';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { AscImageModule } from 'src/app/components/image-components/image-components.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AscGridsModule } from 'src/app/components/grids/grids.module';
import { AscAlbumModule } from 'src/app/components/album-components/album-components.module';

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

    AscPlaylistViewModule,
    AscSongModule,
    AscBadgeModule,
    AscImageModule,
    AscGridsModule,
    AscAlbumModule,

    MatTooltipModule
  ]
})
export class SongModule { }
