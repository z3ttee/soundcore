import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SearchIndexComponent } from './views/search-index/search-index.component';
import { SCNGXScreenModule, SCNGXToolbarModule, SCNGXUiRowModule } from 'soundcore-ngx';
import { SCNGXHorizontalGridModule } from 'soundcore-ngx';
import { SCNGXAlbumGridItemModule } from 'soundcore-ngx';
import { SCNGXPlaylistGridItemModule } from 'soundcore-ngx';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ReactiveFormsModule } from '@angular/forms';

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
    ReactiveFormsModule,
    Error404Module,

    SCNGXScreenModule,
    SCNGXToolbarModule,
    SCNGXUiRowModule,
    SCNGXHorizontalGridModule,
    SCNGXAlbumGridItemModule,
    SCNGXPlaylistGridItemModule
  ]
})
export class SearchModule { }
