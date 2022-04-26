import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from './views/profile-info/profile-info.component';
import { RouterModule, Routes } from '@angular/router';
import { SCDKProfileModule } from 'soundcore-sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { ListViewModule } from 'src/app/components/resource-views/list-view/list-view.module';

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
    
    Error404Module,
    ListViewModule,

    SCDKProfileModule
  ]
})
export class ProfileModule { }
