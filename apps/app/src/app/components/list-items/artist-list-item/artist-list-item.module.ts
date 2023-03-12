import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtistListItemComponent } from './artist-list-item.component';
import { LottieModule } from 'ngx-lottie';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { SCNGXArtworkModule, SCNGXSkeletonModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    SCNGXArtistListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieModule,

    MatRippleModule,

    SCNGXArtworkModule,
    SCNGXSkeletonModule
  ],
  exports: [
    SCNGXArtistListItemComponent
  ]
})
export class SCNGXArtistListItemModule { }
