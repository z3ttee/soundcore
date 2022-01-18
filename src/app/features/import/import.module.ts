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

const routes: Routes = [
  { path: "", component: ImportIndexComponent }
]

@NgModule({
  declarations: [
    ImportIndexComponent,
    ImportListItemComponent,
    CreateImportComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    ReactiveFormsModule,
    MatSelectModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    
    AppCommonModule,
    PipesModule
  ],
  providers: [
    ImportService,
    BucketService,
    IndexStatusService,
    MountService
  ]
})
export class ImportModule { }
