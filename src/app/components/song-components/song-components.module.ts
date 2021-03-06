import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from './song-grid-item/song-grid-item.component';
import { RouterModule } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscImageModule } from '../image-components/image-components.module';
import { LottieCacheModule, LottieModule } from 'ngx-lottie';
import player from 'lottie-web/build/player/lottie_light';
import { SongListComponent } from './song-list/song-list.component';
import { MatButtonModule } from '@angular/material/button';
import {CdkTableModule} from '@angular/cdk/table';
import { AscSongContextMenuModule } from '../context-menus/song-context-menu/song-context-menu.module';
import { AscGridItemTemplateModule } from '../grid-items/grid-item-template/grid-item-template.module';

export function playerFactory() {
  return player
}

@NgModule({
  declarations: [
    SongGridItemComponent,
    SongListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PipesModule,

    AscImageModule,
    AscSongContextMenuModule,
    AscGridItemTemplateModule,

    MatButtonModule,
    CdkTableModule,

    LottieModule.forRoot({
      player: playerFactory
    }),
    LottieCacheModule.forRoot()
  ],
  exports: [
    SongGridItemComponent,
    SongListComponent
  ]
})
export class AscSongModule {}
