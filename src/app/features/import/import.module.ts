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

const routes: Routes = [
  { path: "", component: ImportIndexComponent }
]

@NgModule({
  declarations: [
    ImportIndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    ReactiveFormsModule,
    MatSelectModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    
    AppCommonModule
  ],
  providers: [
    ImportService
  ]
})
export class ImportModule { }
