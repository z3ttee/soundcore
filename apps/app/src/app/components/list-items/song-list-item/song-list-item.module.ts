import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSongListItemComponent } from './song-list-item.component';
import { LottieModule } from 'ngx-lottie';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { SCNGXAddedToPlaylistPipeModule, SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXTooltipModule } from '@soundcore/ngx';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlaySolid, heroPauseSolid, heroEllipsisVerticalSolid, heroHeartSolid } from '@ng-icons/heroicons/solid';
import { heroHeart } from '@ng-icons/heroicons/outline';
@NgModule({
  declarations: [
    SCNGXSongListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieModule,
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
    LottieModule
  ]
})
export class SCNGXSongListItemModule {}
