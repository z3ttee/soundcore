import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './services/user.service';
import { UserInfoComponent } from './views/user-info/user-info.component';
import { RouterModule, Routes } from '@angular/router';
import { AscPlaylistViewModule } from 'src/app/components/views/playlist-view.module';

const routes: Routes = [
  { path: ":userId", component: UserInfoComponent }
]

@NgModule({
  declarations: [
    UserInfoComponent
  ],
  providers: [
    UserService
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    AscPlaylistViewModule
  ]
})
export class UserModule { }
