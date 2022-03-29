import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBadgeComponent } from './label-badge/label-badge.component';
import { AscImageModule } from '../image-components/image-components.module';
import { ArtistBadgeComponent } from './artist-badge/artist-badge.component';

@NgModule({
  declarations: [
    LabelBadgeComponent,
    ArtistBadgeComponent
  ],
  imports: [
    CommonModule,
    AscImageModule
  ],
  exports: [
    LabelBadgeComponent,
    ArtistBadgeComponent
  ]
})
export class AscBadgeModule { }
