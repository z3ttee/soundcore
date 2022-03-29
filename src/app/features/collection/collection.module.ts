import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionInfoComponent } from './views/collection-info/collection-info.component';
import { RouterModule, Routes } from '@angular/router';
import { CollectionService } from './services/collection.service';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AscImageModule } from 'src/app/components/image-components/image-components.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { AscSongModule } from 'src/app/components/song-components/song-components.module';
import { AscPlaylistViewModule } from 'src/app/components/views/playlist-view.module';
import { AscProfileBadgeModule } from 'src/app/components/badge-components/profile-badge/profile-badge.module';
import { AscMessageModule } from 'src/app/components/message-components/message-components.module';

const routes: Routes = [
  { path: "", component: CollectionInfoComponent }
]

@NgModule({
  declarations: [
    CollectionInfoComponent
  ],
  providers: [
    CollectionService
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    PipesModule,
    AscImageModule,
    AscBadgeModule,
    AscProfileBadgeModule,
    AscSongModule,
    AscPlaylistViewModule,
    AscMessageModule,

    MatProgressBarModule
  ]
})
export class CollectionModule { }
