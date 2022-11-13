import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { ProfileBarModule } from 'src/app/components/profile-bar/profile-bar.module';
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule, SCNGXToolbarModule } from '@soundcore/ngx';
import { HeroIconModule, home, search, user, bookmarkAlt, chevronDown, plus, arrowLeft, cubeTransparent, documentAdd, lightningBolt, dotsVertical } from 'ng-heroicon';

@NgModule({
  declarations: [
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ProfileBarModule,
        
    SCNGXDrawerModule,
    SCNGXBottomNavModule,
    SCNGXProgressbarModule,
    SCNGXToolbarModule,

    HeroIconModule.withIcons({ home, search, user, bookmarkAlt, chevronDown, plus, arrowLeft, cubeTransparent, documentAdd, lightningBolt, dotsVertical }, { defaultHostDisplay: 'inlineBlock', attachDefaultDimensionsIfNoneFound: true })
  ]
})
export class AdminLayoutModule { }
