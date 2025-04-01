import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroHeart } from '@ng-icons/heroicons/outline';
import { heroEllipsisVerticalSolid, heroHeartSolid, heroPauseSolid, heroPlaySolid } from '@ng-icons/heroicons/solid';
import { SCNGXAddedToPlaylistPipeModule, SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXTooltipModule } from '@repo/angular-ui';
import { LottieComponent } from 'ngx-lottie';
import { SCNGXSongListItemComponent } from './song-list-item.component';
@NgModule({
  declarations: [
    SCNGXSongListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieComponent,
    NgIconsModule.withIcons({ heroHeart, heroHeartSolid, heroPlaySolid, heroPauseSolid, heroEllipsisVerticalSolid }),

    MatRippleModule,

    SCNGXArtworkModule,
    SCNGXExplicitBadgeModule,
    SCNGXSongDurationPipeModule,
    SCNGXAddedToPlaylistPipeModule,
    SCNGXTooltipModule,
    SCNGXSkeletonModule,
    SCNGXIconBtnModule
  ],
  exports: [
    SCNGXSongListItemComponent,
    LottieComponent
  ]
})
export class SCNGXSongListItemModule { }
