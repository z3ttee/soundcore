import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from './song-grid-item/song-grid-item.component';
import { RouterModule } from '@angular/router';
import { SongListItemComponent } from './song-list-item/song-list-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscImageModule } from '../image-components/image-components.module';
import { LottieCacheModule, LottieModule } from 'ngx-lottie';
import player from 'lottie-web/build/player/lottie_light';
import { SongListComponent } from './song-list/song-list.component';
import { MatButtonModule } from '@angular/material/button';

export function playerFactory() {
  return player
}

@NgModule({
  declarations: [
    SongGridItemComponent,
    SongListItemComponent,
    SongListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PipesModule,

    AscImageModule,
    MatButtonModule,

    LottieModule.forRoot({
      player: playerFactory
    }),
    LottieCacheModule.forRoot()
  ],
  exports: [
    SongGridItemComponent,
    SongListItemComponent,
    SongListComponent
  ]
})
export class AscSongModule {}
