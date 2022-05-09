import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistProfileComponent } from './views/artist-profile/artist-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { SCDKArtistModule } from 'soundcore-sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ListViewModule } from "src/app/components/resource-views/list-view/list-view.module";
import { HeroIconModule, dotsVertical } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { SCNGXVirtualSongListModule, SCNGXSongListModule } from 'soundcore-ngx';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

const routes: Routes = [
  { path: ":artistId", component: ArtistProfileComponent },
  { path: "**", redirectTo: "/" }
]

@NgModule({
  declarations: [
    ArtistProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module,
    HeroIconModule.withIcons({ dotsVertical }),
    VirtualScrollerModule,

    MatRippleModule,

    ListViewModule,

    SCDKArtistModule,
    SCNGXVirtualSongListModule,
    SCNGXSongListModule
  ]
})
export class ArtistModule { }
