import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadIndexComponent } from './views/upload-index/upload-index.component';
import { RouterModule, Routes } from '@angular/router';
import { QuickInfoComponent } from './components/quick-info/quick-info.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { StatsItemComponent } from './components/stats-item/stats-item.component';
import { UploadListItemComponent } from './components/upload-list-item/upload-list-item.component';
import { AppCommonModule } from 'src/app/common.module';
import {MatDialogModule} from '@angular/material/dialog';
import { ConfirmAbortDialog } from './dialogs/confirm-abort/confirm-abort.component';
import { MatButtonModule } from '@angular/material/button';
import { IndexListItemComponent } from './components/index-list-item/index-list-item.component';
import { StatusPipePipe } from './pipes/status-pipe.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';


const routes: Routes = [
  { path: "", component: UploadIndexComponent }
]

@NgModule({
  declarations: [
    QuickInfoComponent,
    StatsItemComponent,
    UploadListItemComponent,
    UploadIndexComponent,
    ConfirmAbortDialog,
    IndexListItemComponent,
    StatusPipePipe
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    RouterModule.forChild(routes),

    MatPaginatorModule,
    MatProgressBarModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class UploadModule { }