import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscImageModule } from '../../image-components/image-components.module';
import { RouterModule } from '@angular/router';
import { LottieCacheModule, LottieModule } from 'ngx-lottie';
import player from 'lottie-web/build/player/lottie_light';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { AscSongContextMenuModule } from '../../context-menus/song-context-menu/song-context-menu.module';
import { AscSongListComponent } from './song-list.component';

export function playerFactory() {
  return player
}

@NgModule({
  declarations: [
    AscSongListComponent
  ],
  imports: [
    RouterModule,
    CommonModule,

    PipesModule,
    AscImageModule,
    AscSongContextMenuModule,

    MatProgressBarModule,
    MatRippleModule,

    LottieModule.forRoot({
      player: playerFactory
    }),
    LottieCacheModule.forRoot()
  ],
  exports: [
    AscSongListComponent
  ]
})
export class AscSongListModule { }
