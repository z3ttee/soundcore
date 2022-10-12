import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSongListItemComponent } from './song-list-item.component';
import { LottieModule } from 'ngx-lottie';
import { SCNGXArtworkModule } from '../../images/artwork/artwork.module';
import { MatRippleModule } from '@angular/material/core';
import { SCNGXSongDurationPipeModule } from '../../../pipes/song-duration/song-duration.module';
import { SCNGXAddedToPlaylistPipeModule } from '../../../pipes/added-to-playlist/added-to-playlist.module';
import { RouterModule } from '@angular/router';
import { SCNGXExplicitBadgeModule } from "../../badges/explicit-badge/explicit-badge.module"
import { SCNGXTooltipModule } from '../../../ui/tooltip/tooltip.module';
import { SCNGXSkeletonModule } from '../../skeletons/skeleton/skeleton.module';
import { HeroIconModule, heart } from 'ng-heroicon';

@NgModule({
  declarations: [
    SCNGXSongListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieModule,
    HeroIconModule.withIcons({ heart }),

    MatRippleModule,

    SCNGXArtworkModule,
    SCNGXExplicitBadgeModule,
    SCNGXSongDurationPipeModule,
    SCNGXAddedToPlaylistPipeModule,
    SCNGXTooltipModule,
    SCNGXSkeletonModule
  ],
  exports: [
    SCNGXSongListItemComponent,

    SCNGXArtworkModule,
    SCNGXExplicitBadgeModule,
    SCNGXSongDurationPipeModule,
    SCNGXAddedToPlaylistPipeModule,
    SCNGXTooltipModule,
    SCNGXSkeletonModule
  ]
})
export class SCNGXSongListItemModule { }
