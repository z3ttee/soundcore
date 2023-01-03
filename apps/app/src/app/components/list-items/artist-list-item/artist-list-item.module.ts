import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtistListItemComponent } from './artist-list-item.component';
import { LottieModule } from 'ngx-lottie';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { HeroIconModule, heart } from 'ng-heroicon';
import { SCNGXArtworkModule, SCNGXSkeletonModule } from '@soundcore/ngx';

@NgModule({
  declarations: [
    SCNGXArtistListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieModule,
    HeroIconModule.withIcons({ heart }),

    MatRippleModule,

    SCNGXArtworkModule,
    SCNGXSkeletonModule
  ],
  exports: [
    SCNGXArtistListItemComponent
  ]
})
export class SCNGXArtistListItemModule { }
