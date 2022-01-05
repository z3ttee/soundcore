import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongItemComponent } from './components/song-item/song-item.component';
import { SongArtistsPipe } from './pipes/song-artists.pipe';

@NgModule({
  declarations: [
    SongItemComponent,
    SongArtistsPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SongItemComponent,
  ]
})
export class SongModule { }
