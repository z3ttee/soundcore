import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from './song-grid-item.component';
import { SCNGXArtworkModule, SCNGXResourceGridItemModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    SongGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXResourceGridItemModule,
    SCNGXArtworkModule
  ],
  exports: [
    SongGridItemComponent
  ]
})
export class SongGridItemModule { }
