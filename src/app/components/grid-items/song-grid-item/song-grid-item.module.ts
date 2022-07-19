import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from './song-grid-item.component';
import { SCNGXArtworkModule, SCNGXResourceGridItemModule } from 'soundcore-ngx';
import { SCCDKContextMenuModule } from 'soundcore-cdk';
import { SongContextMenuModule } from '../../context-menus/song-context-menu/song-context-menus.module';

@NgModule({
  declarations: [
    SongGridItemComponent
  ],
  imports: [
    CommonModule,
    SCNGXResourceGridItemModule,
    SCNGXArtworkModule,
    SCCDKContextMenuModule,

    SongContextMenuModule
  ],
  exports: [
    SongGridItemComponent
  ]
})
export class SongGridItemModule { }
