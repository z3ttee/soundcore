import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBadgeComponent } from './label-badge/label-badge.component';
import { ProfileBadgeComponent } from './profile-badge/profile-badge.component';

@NgModule({
  declarations: [
    LabelBadgeComponent,
    ProfileBadgeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LabelBadgeComponent,
    ProfileBadgeComponent
  ]
})
export class AscBadgeModule { }
