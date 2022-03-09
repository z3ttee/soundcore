import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportIndexComponent } from './views/import-index/import-index.component';
import { RouterModule, Routes } from '@angular/router';
import {MatSelectModule} from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppCommonModule } from 'src/app/common.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ImportService } from './services/import.service';
import { BucketService } from '../storage/services/bucket.service';
import { MountService } from '../storage/services/mount.service';
import { IndexStatusService } from '../upload/services/index-status.service';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ImportListItemComponent } from './components/import-list-item/import-list-item.component';
import { CreateImportComponent } from './dialogs/create-import/create-import.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ImportStatusService } from './services/import-status.service';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { AscMessageModule } from 'src/app/components/message-components/message-components.module';
import { TeleportModule } from '@ngneat/overview';
import { ImportYoutubeComponent } from './views/import-youtube/import-youtube.component';
import { ImportSpotifyComponent } from './views/import-spotify/import-spotify.component';
import { CreateSpotifyDialogComponent } from './dialogs/create-spotify-import/create-spotify.component';

const routes: Routes = [
  { path: "", component: ImportIndexComponent, children: [
    { path: "", component: ImportYoutubeComponent },
    { path: "spotify", component: ImportSpotifyComponent }
  ]}
]

@NgModule({
  declarations: [
    ImportIndexComponent,
    ImportYoutubeComponent,
    ImportSpotifyComponent,
    ImportListItemComponent,

    CreateSpotifyDialogComponent,
    CreateImportComponent
  ],
  imports: [
    TeleportModule,
    CommonModule,
    RouterModule.forChild(routes),

    ReactiveFormsModule,
    MatSelectModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    
    AppCommonModule,
    PipesModule,
    AscBadgeModule,
    AscMessageModule
  ],
  providers: [
    ImportService,
    BucketService,
    IndexStatusService,
    MountService,
    ImportStatusService
  ]
})
export class ImportModule { }
