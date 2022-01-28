import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistInfoComponent } from './views/artist-info/artist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { TopSongItemComponent } from './components/top-song-item/top-song-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';

const routes: Routes = [
  { path: ":artistId", component: ArtistInfoComponent }
]

@NgModule({
  declarations: [
    ArtistInfoComponent,
    TopSongItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PipesModule,

    AscSongModule,

    MatProgressBarModule,
    MatButtonModule
  ]
})
export class ArtistModule { }
