import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBarComponent } from './profile-bar.component';
import { chevronDown, HeroIconModule, cog, bell, logout, shieldExclamation } from 'ng-heroicon';
import { SCNGXNavListItemModule } from 'soundcore-ngx';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ProfileBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    HeroIconModule.withIcons({ chevronDown, cog, bell, logout, shieldExclamation }, { defaultHostDisplay: 'inlineBlock', attachDefaultDimensionsIfNoneFound: true }),
    SCNGXNavListItemModule
  ],
  exports: [
    ProfileBarComponent
  ]
})
export class ProfileBarModule { }
