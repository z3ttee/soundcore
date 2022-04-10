import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: ":playlistId", component: PlaylistInfoComponent }
]

@NgModule({
  declarations: [
    PlaylistInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PlaylistModule { }
