import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { CreatePlaylistDialog } from './dialogs/create-playlist/create-playlist.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import { AppCommonModule } from 'src/app/common.module';
import { PlaylistInfoComponent } from './views/playlist-info/playlist-info.component';
import { TotalPlaylistDurationPipe } from './pipes/total-duration.pipe';
import { PlaylistPrivacyPipe } from './pipes/playlist-privacy.pipe';
import { ChoosePlaylistComponent } from './dialogs/choose-playlist/choose-playlist.component';
import { PlaylistListItemComponent } from 'src/app/components/list-items/playlist-list-item/playlist-list-item.component';

const routes: Routes = [
  { path: ":playlistId", component: PlaylistInfoComponent }
]

@NgModule({
  declarations: [
    CreatePlaylistDialog,
    PlaylistInfoComponent,
    TotalPlaylistDurationPipe,
    PlaylistPrivacyPipe,
    ChoosePlaylistComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppCommonModule,
    RouterModule.forChild(routes),

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
