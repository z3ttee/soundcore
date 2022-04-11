import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { SCNGXScreenModule, SCNGXToolbarModule } from 'soundcore-ngx';

const routes: Routes = [
  { path: "", component: SearchIndexComponent }
]

@NgModule({
  declarations: [
    SearchIndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    SCNGXScreenModule,
    SCNGXToolbarModule
  ]
})
export class SearchModule { }
