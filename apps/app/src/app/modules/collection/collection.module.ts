import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Routes } from '@angular/router';
import { SCNGXIconBtnModule, SCNGXScrollingModule } from '@repo/angular-ui';
import { SCSDKCollectionModule } from '@repo/angular-sdk';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { SCNGXCollectionViewModule } from 'src/app/components/resource-views/collection-view/collection-view.module';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { CollectionComponent } from './views/collection/collection.component';

const routes: Routes = [
  { path: "", component: CollectionComponent }
]

@NgModule({
  declarations: [
    CollectionComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    Error404Module,
    ListViewModule,

    MatSnackBarModule,

    SCNGXSongListItemModule,
    SCNGXIconBtnModule,
    SCNGXCollectionViewModule,
    SCNGXScrollingModule,

    SCSDKCollectionModule
  ]
})
export class CollectionModule { }
