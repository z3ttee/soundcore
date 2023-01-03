import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumInfoComponent } from './views/album-info/album-info.component';
import { RouterModule, Routes } from '@angular/router';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { SCDKAlbumModule } from '@soundcore/sdk';
import { SCNGXAlbumGridItemModule, SCNGXArtworkModule, SCNGXHorizontalListModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXSongDurationPipeModule, SCNGXTableModule, SCNGXUiRowModule } from '@soundcore/ngx';
import { HeroIconModule, heart, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXSongListItemModule } from 'src/app/components/list-items/song-list-item/song-list-item.module';
import { SongContextMenuModule } from 'src/app/components/menus/song-context-menu/song-context-menu.module';

const routes: Routes = [
  { path: ":albumId", component: AlbumInfoComponent },
  { path: "**", redirectTo: "/"}
]

@NgModule({
  declarations: [
    AlbumInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListViewModule,
    HeroIconModule.withIcons({ heart, dotsVertical }),

    ListViewModule,
    SongContextMenuModule,

    MatRippleModule,

    SCDKAlbumModule,

    SCNGXSongDurationPipeModule,
    SCNGXHorizontalListModule,
    SCNGXUiRowModule,
    SCNGXAlbumGridItemModule,
    SCNGXTableModule,
    SCNGXIconBtnModule,
    SCNGXSongListItemModule,
    SCNGXArtworkModule,
    SCNGXScrollingModule,

    Error404Module
  ]
})
export class AlbumModule { }
