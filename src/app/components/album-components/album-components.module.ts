import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumGridItemComponent } from './album-grid-item/album-grid-item.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AlbumGridItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AlbumGridItemComponent
  ]
})
export class AscAlbumModule { }
