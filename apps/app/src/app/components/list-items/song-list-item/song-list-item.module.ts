import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXSongListItemComponent } from './song-list-item.component';
import { LottieModule } from 'ngx-lottie';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { HeroIconModule, heart } from 'ng-heroicon';
import { SCNGXAddedToPlaylistPipeModule, SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule, SCNGXSkeletonModule, SCNGXSongDurationPipeModule, SCNGXTooltipModule } from '@soundcore/ngx';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisV, faHeart, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    SCNGXSongListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LottieModule,
    HeroIconModule.withIcons({ heart }),
    FontAwesomeModule,

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
  ]
})
export class SCNGXSongListItemModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faPlay, faPause, faEllipsisV, faHeart);
  }
}
