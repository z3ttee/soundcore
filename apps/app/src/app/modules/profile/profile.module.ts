import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from './views/profile-info/profile-info.component';
import { RouterModule, Routes } from '@angular/router';
import { SCDKProfileModule, SCDKUserModule } from '@soundcore/sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';
import { SCNGXPlaylistGridItemModule, SCNGXTooltipModule, SCNGXUiRowModule } from 'soundcore-ngx';
import { VirtualScrollerModule } from '@tsalliance/ngx-virtual-scroller';

const routes: Routes = [
  { path: "", redirectTo: "@me" },
  { path: ":profileId", component: ProfileInfoComponent }

]

@NgModule({
  declarations: [
    ProfileInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    VirtualScrollerModule,
    
    Error404Module,
    ListViewModule,

    SCNGXPlaylistGridItemModule,
    SCNGXTooltipModule,
    SCNGXUiRowModule,

    SCDKProfileModule,
    SCDKUserModule
  ]
})
export class ProfileModule { }
