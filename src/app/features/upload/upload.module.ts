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

const routes: Routes = [
  { path: "", component: UploadIndexComponent }
]

@NgModule({
  declarations: [
    QuickInfoComponent,
    StatsItemComponent,
    UploadListItemComponent,
    UploadIndexComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    RouterModule.forChild(routes),

    MatPaginatorModule,
    MatProgressBarModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule
  ]
})
export class UploadModule { }
