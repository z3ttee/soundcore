import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { CreatePlaylistDialog } from './dialogs/create-playlist/create-playlist.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AppCommonModule } from 'src/app/common.module';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { PlaylistPrivacyPipe } from './pipes/playlist-privacy.pipe';
import { ChoosePlaylistComponent } from './dialogs/choose-playlist/choose-playlist.component';
import { SongListItemComponent } from 'src/app/components/list-items/song-list-item/song-list-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ProfileBadgeComponent } from 'src/app/components/badges/profile-badge/profile-badge.component';

const routes: Routes = [
  { path: ":playlistId", component: PlaylistInfoComponent }
]

@NgModule({
  declarations: [
    CreatePlaylistDialog,
    PlaylistInfoComponent,
    PlaylistPrivacyPipe,
    ChoosePlaylistComponent,
    SongListItemComponent,
    ProfileBadgeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppCommonModule,
    RouterModule.forChild(routes),

    PipesModule,

    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule
  ],
  exports: [
    CreatePlaylistDialog
  ]
})
export class PlaylistModule { }
