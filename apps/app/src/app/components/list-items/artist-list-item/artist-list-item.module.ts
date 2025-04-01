import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { SCNGXArtworkModule, SCNGXSkeletonModule } from '@repo/angular-ui';
import { LottieComponent } from 'ngx-lottie';
import { SCNGXArtistListItemComponent } from './artist-list-item.component';

@NgModule({
  declarations: [
    SCNGXArtistListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieComponent,

    MatRippleModule,

    SCNGXArtworkModule,
    SCNGXSkeletonModule
  ],
  exports: [
    SCNGXArtistListItemComponent
  ]
})
export class SCNGXArtistListItemModule { }
