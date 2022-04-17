import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { RouterModule, Routes } from '@angular/router';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { HeroIconModule, play, heart, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { SCDurationPipeModule } from 'src/app/pipes/duration/duration-pipe.module';
import { SCNGXSkeletonModule } from 'soundcore-ngx';

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
    Error404Module,
    HeroIconModule.withIcons({ play, heart, dotsVertical }),
    MatRippleModule,
    SCDurationPipeModule,

    SCNGXSkeletonModule
  ]
})
export class PlaylistModule { }
