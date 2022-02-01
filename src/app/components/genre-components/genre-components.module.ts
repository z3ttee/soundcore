import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreGridItemComponent } from './genre-grid-item/genre-grid-item.component';

@NgModule({
  declarations: [
    GenreGridItemComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GenreGridItemComponent
  ]
})
export class AscGenreModule { }
