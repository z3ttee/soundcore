import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from '../../components/grid-items/song-grid-item/song-grid-item.component';
import { SongArtistsPipe } from './pipes/song-artists.pipe';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

]

@NgModule({
  declarations: [
    SongGridItemComponent,
    SongArtistsPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    SongGridItemComponent,
  ]
})
export class SongModule { }
