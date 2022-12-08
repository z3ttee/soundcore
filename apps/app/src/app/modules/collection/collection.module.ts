import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionComponent } from './views/collection/collection.component';
import { RouterModule, Routes } from '@angular/router';
import { SCSDKCollectionModule } from '@soundcore/sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { UiScrollModule } from 'ngx-ui-scroll';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { SCNGXIconBtnModule } from '@soundcore/ngx';

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
    UiScrollModule,
    ListViewModule,

    SCNGXSongListItemModule,
    SCNGXIconBtnModule,

    SCSDKCollectionModule
  ]
})
export class CollectionModule { }
