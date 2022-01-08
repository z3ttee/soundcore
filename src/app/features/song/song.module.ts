import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongItemComponent } from './components/song-item/song-item.component';
import { SongArtistsPipe } from './pipes/song-artists.pipe';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

]

@NgModule({
  declarations: [
    SongItemComponent,
    SongArtistsPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    SongItemComponent,
  ]
})
export class SongModule { }
