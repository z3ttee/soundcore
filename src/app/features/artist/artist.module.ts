import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistInfoComponent } from './views/artist-info/artist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { SongListItemComponent } from 'src/app/components/list-items/song-list-item/song-list-item.component';

const routes: Routes = [
  { path: ":artistId", component: ArtistInfoComponent }
]

@NgModule({
  declarations: [
    ArtistInfoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    MatProgressBarModule,
    MatButtonModule
  ]
})
export class ArtistModule { }
