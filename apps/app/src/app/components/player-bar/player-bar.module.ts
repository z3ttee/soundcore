import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerBarComponent } from './player-bar.component';
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule } from '@soundcore/ngx';
import { HeroIconModule, arrowsExpand, collection } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    PlayerBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatRippleModule,
    HeroIconModule.withIcons({ arrowsExpand, collection }),

    SCNGXArtworkModule,
    SCNGXExplicitBadgeModule
  ],
  exports: [
    PlayerBarComponent
  ]
})
export class PlayerBarModule { }
