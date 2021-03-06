import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AppCommonModule } from 'src/app/common.module';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { AscMessageModule } from 'src/app/components/message-components/message-components.module';
import { AscImageModule } from 'src/app/components/image-components/image-components.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AscPlaylistViewModule } from 'src/app/components/views/playlist-view.module';
import { AscPlaylistModule } from 'src/app/components/playlist-components/playlist-components.module';
import { AscProfileBadgeModule } from 'src/app/components/badge-components/profile-badge/profile-badge.module';
import { AscPlayableListModule } from 'src/app/components/lists/playable-list/playable-list.module';
import { AscPlaylistGridItemModule } from 'src/app/components/playlist-components/playlist-grid-item/playlist-grid-item.module';

const routes: Routes = [
  { path: ":playlistId", component: PlaylistInfoComponent }
]

@NgModule({
  declarations: [
    PlaylistInfoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppCommonModule,
    RouterModule.forChild(routes),

    PipesModule,
    AscSongModule,
    AscBadgeModule,
    AscProfileBadgeModule,
    AscMessageModule,
    AscImageModule,
    AscPlaylistModule,
    AscPlaylistGridItemModule,
    AscPlaylistViewModule,
    AscPlayableListModule,

    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTooltipModule
  ],
  exports: []
})
export class PlaylistModule { }
