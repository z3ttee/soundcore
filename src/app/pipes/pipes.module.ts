import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongDurationPipe } from './song-duration.pipe';
import { SongArtistsPipe } from './song-artists.pipe';
import { AddedToPlaylistPipe } from './added-to-playlist.pipe';
import { TotalDurationPipe } from './total-duration.pipe';

@NgModule({
  declarations: [
    SongDurationPipe,
    SongArtistsPipe,
    AddedToPlaylistPipe,
    TotalDurationPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SongDurationPipe,
    SongArtistsPipe,
    AddedToPlaylistPipe,
    TotalDurationPipe
  ]
})
export class PipesModule { }
