import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SCNGXPlaylistGridItemModule, SCNGXScrollingModule, SCNGXTooltipModule, SCNGXUiRowModule } from '@repo/angular-ui';
import { SCDKUserModule, SCSDKProfileModule } from '@repo/angular-sdk';
import { SCNGXArtistListItemModule } from 'src/app/components/list-items/artist-list-item/artist-list-item.module';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ProfileInfoComponent } from './views/profile-info/profile-info.component';

const routes: Routes = [
  { path: "", redirectTo: "@me", pathMatch: "full" },
  { path: ":profileId", component: ProfileInfoComponent }
]

@NgModule({
  declarations: [
    ProfileInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Error404Module,
    ListViewModule,

    SCNGXPlaylistGridItemModule,
    SCNGXTooltipModule,
    SCNGXUiRowModule,
    SCNGXArtistListItemModule,
    SCNGXScrollingModule,

    SCSDKProfileModule,
    SCDKUserModule
  ]
})
export class ProfileModule { }
