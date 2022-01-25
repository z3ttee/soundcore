import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBadgeComponent } from './label-badge/label-badge.component';
import { ProfileBadgeComponent } from './profile-badge/profile-badge.component';
import { AscImageModule } from '../image-components/image-components.module';
import { ArtistBadgeComponent } from './artist-badge/artist-badge.component';

@NgModule({
  declarations: [
    LabelBadgeComponent,
    ProfileBadgeComponent,
    ArtistBadgeComponent
  ],
  imports: [
    CommonModule,
    AscImageModule
  ],
  exports: [
    LabelBadgeComponent,
    ProfileBadgeComponent,
    ArtistBadgeComponent
  ]
})
export class AscBadgeModule { }
