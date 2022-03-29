import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumGridItemComponent } from './album-grid-item/album-grid-item.component';
import { RouterModule } from '@angular/router';
import { AscImageModule } from '../image-components/image-components.module';

@NgModule({
  declarations: [
    AlbumGridItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    AscImageModule
  ],
  exports: [
    AlbumGridItemComponent,
  ]
})
export class AscAlbumModule { }
