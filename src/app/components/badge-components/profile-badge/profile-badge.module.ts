import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBadgeComponent } from './profile-badge.component';
import { AscImageModule } from '../../image-components/image-components.module';

@NgModule({
  declarations: [
    ProfileBadgeComponent
  ],
  imports: [
    CommonModule,
    AscImageModule
  ],
  exports: [
    ProfileBadgeComponent
  ]
})
export class AscProfileBadgeModule { }
