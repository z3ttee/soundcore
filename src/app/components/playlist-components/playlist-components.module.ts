import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AscImageModule } from '../image-components/image-components.module';
import { PlaylistGridItemComponent } from './playlist-grid-item/playlist-grid-item.component';

@NgModule({
  declarations: [
    PlaylistGridItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    AscImageModule
  ],
  exports: [
    PlaylistGridItemComponent
  ]
})
export class AscPlaylistModule { }
