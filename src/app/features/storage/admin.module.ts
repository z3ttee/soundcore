import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminIndexComponent } from './views/admin-index/admin-index.component';
import { RouterModule, Routes } from '@angular/router';
import { MountListItemComponent } from './components/mount-list-item/mount-list-item.component';
import { BucketService } from './services/bucket.service';
import { MountService } from './services/mount.service';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import { MountEditorDialog } from './dialogs/mount-editor.dialog';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressBarModule} from '@angular/material/progress-bar';

const routes: Routes = [

  { path: "", component: AdminIndexComponent }

]

@NgModule({
  declarations: [
    AdminIndexComponent,
    MountListItemComponent,
    MountEditorDialog
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    MatSelectModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  providers: [
    BucketService,
    MountService
  ]
})
export class AdminModule { }
