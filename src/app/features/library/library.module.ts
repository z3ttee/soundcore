import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryIndexComponent } from './views/library-index/library-index.component';
import { RouterModule, Routes } from '@angular/router';

import {MatTabsModule} from '@angular/material/tabs';
import {MatPaginatorModule} from '@angular/material/paginator';

import { LibraryUploadsComponent } from './views/library-uploads/library-uploads.component';
import { LibraryPlaylistsComponent } from './views/library-playlists/library-playlists.component';
import { LibraryService } from './services/library.service';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import { TeleportModule } from '@ngneat/overview';
import { AppCommonModule } from 'src/app/common.module';
import { SongModule } from '../song/song.module';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';

const routes: Routes = [
  { path: "", component: LibraryIndexComponent, children: [
    { path: "", component: LibraryPlaylistsComponent },
    { path: "uploads", component: LibraryUploadsComponent },
  ]},
]

@NgModule({
  declarations: [
    LibraryIndexComponent,
    LibraryUploadsComponent,
    LibraryPlaylistsComponent
  ],
  providers: [
    LibraryService
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    TeleportModule,
    AppCommonModule,

    AscSongModule,

    // Import Angular Material components
    MatTabsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    MatStepperModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule
  ]
})
export class LibraryModule { }
