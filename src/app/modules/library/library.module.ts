import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryIndexComponent } from './views/library-index/library-index.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: LibraryIndexComponent }
]

@NgModule({
  declarations: [
    LibraryIndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LibraryModule { }
