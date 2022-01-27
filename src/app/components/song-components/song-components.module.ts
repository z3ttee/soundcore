import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from './song-grid-item/song-grid-item.component';
import { RouterModule } from '@angular/router';
import { SongListItemComponent } from './song-list-item/song-list-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscImageModule } from '../image-components/image-components.module';
import { LottieCacheModule, LottieModule } from 'ngx-lottie';
import player from 'lottie-web/build/player/lottie_light';

export function playerFactory() {
  return player
}

@NgModule({
  declarations: [
    SongGridItemComponent,
    SongListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PipesModule,

    AscImageModule,

    LottieModule.forRoot({
      player: playerFactory
    }),
    LottieCacheModule.forRoot()
  ],
  exports: [
    SongGridItemComponent,
    SongListItemComponent
  ]
})
export class AscSongModule {}
