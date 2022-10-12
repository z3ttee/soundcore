import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumInfoComponent } from './views/album-info/album-info.component';
import { RouterModule, Routes } from '@angular/router';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { SCDKAlbumModule } from '@soundcore/sdk';
import { SCNGXAlbumGridItemModule, SCNGXHorizontalGridModule, SCNGXSongDurationPipeModule, SCNGXUiRowModule, SCNGXVirtualSongListModule } from 'soundcore-ngx';
import { HeroIconModule, heart, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';

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
    VirtualScrollerModule,
    ListViewModule,
    HeroIconModule.withIcons({ heart, dotsVertical }),

    MatRippleModule,

    SCDKAlbumModule,

    SCNGXSongDurationPipeModule,
    SCNGXVirtualSongListModule,
    SCNGXHorizontalGridModule,
    SCNGXUiRowModule,
    SCNGXAlbumGridItemModule
  ]
})
export class AlbumModule { }
