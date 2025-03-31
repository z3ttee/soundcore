import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCNGXArtworkModule, SCNGXResourceGridItemModule } from '@repo/angular-components';
import { SongGridItemComponent } from './song-grid-item.component';

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
