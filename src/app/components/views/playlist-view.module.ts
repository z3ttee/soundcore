import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistViewComponent } from './playlist-view/playlist-view.component';
import { AscImageModule } from '../image-components/image-components.module';
import { AscBadgeModule } from '../badge-components/badge-components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { PlaylistViewTypePipe } from './pipes/playlist-view-type.pipe';
import { AscPlayButtonModule } from '../buttons/play-button/play-button.module';
import { AscLikeButtonModule } from '../buttons/like-button/like-button.module';

@NgModule({
  declarations: [
    PlaylistViewComponent,

    PlaylistViewTypePipe
  ],
  imports: [
    CommonModule,

    AscImageModule,
    AscBadgeModule,
    AscPlayButtonModule,
    AscLikeButtonModule,
    PipesModule
  ],
  exports: [
    PlaylistViewComponent
  ]
})
export class AscPlaylistViewModule { }
