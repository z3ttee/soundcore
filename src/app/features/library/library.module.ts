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
import { LibraryQueueComponent } from './views/library-queue/library-queue.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import { UploadListItemComponent } from './components/upload-list-item/upload-list-item.component';
import { TeleportModule } from '@ngneat/overview';


const routes: Routes = [
  { path: "", component: LibraryIndexComponent, children: [
    { path: "", component: LibraryPlaylistsComponent },
    { path: "uploads", component: LibraryUploadsComponent },
    { path: "queue", component: LibraryQueueComponent }
  ]},
]

@NgModule({
  declarations: [
    LibraryIndexComponent,
    LibraryUploadsComponent,
    LibraryPlaylistsComponent,
    LibraryQueueComponent,
    UploadListItemComponent
  ],
  providers: [
    LibraryService
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    TeleportModule,

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
