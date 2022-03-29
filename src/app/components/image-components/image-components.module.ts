import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtworkComponent } from './artwork/artwork.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';



@NgModule({
  declarations: [
    ArtworkComponent,
    UserAvatarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ArtworkComponent,
    UserAvatarComponent
  ]
})
export class AscImageModule { }
