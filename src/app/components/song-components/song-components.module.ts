import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from './song-grid-item/song-grid-item.component';
import { RouterModule } from '@angular/router';
import { SongListItemComponent } from './song-list-item/song-list-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  declarations: [
    SongGridItemComponent,
    SongListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PipesModule,
  ],
  exports: [
    SongGridItemComponent,
    SongListItemComponent
  ]
})
export class AscSongModule {}
