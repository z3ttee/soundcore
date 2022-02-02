import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongDurationPipe } from './song-duration.pipe';
import { SongArtistsPipe } from './song-artists.pipe';
import { AddedToPlaylistPipe } from './added-to-playlist.pipe';
import { TotalDurationPipe } from './total-duration.pipe';
import { ResourceTypePipe } from './resource-type.pipe';
import { IndexStatusPipe } from './index-status.pipe';
import { PlaylistPrivacyPipe } from './playlist-privacy.pipe';

@NgModule({
  declarations: [
    SongDurationPipe,
    SongArtistsPipe,
    AddedToPlaylistPipe,
    TotalDurationPipe,
    ResourceTypePipe,
    IndexStatusPipe,
    PlaylistPrivacyPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SongDurationPipe,
    SongArtistsPipe,
    AddedToPlaylistPipe,
    TotalDurationPipe,
    ResourceTypePipe,
    IndexStatusPipe,
    PlaylistPrivacyPipe
  ]
})
export class PipesModule { }
