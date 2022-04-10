import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { Error404Module } from 'src/app/shared/error404/error404.module';

const routes: Routes = [
  { path: ":playlistId", component: PlaylistInfoComponent }
]

@NgModule({
  declarations: [
    PlaylistInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module
  ]
})
export class PlaylistModule { }
