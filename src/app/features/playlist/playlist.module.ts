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

const routes: Routes = [

]

@NgModule({
  declarations: [
    CreatePlaylistDialog,
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
