import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleasesIndexComponent } from './views/releases-index/releases-index.component';
import { RouterModule, Routes } from '@angular/router';
import { AppCommonModule } from 'src/app/common.module';

const routes: Routes = [
  { path: "", component: ReleasesIndexComponent }
]

@NgModule({
  declarations: [
    ReleasesIndexComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ReleasesModule { }
