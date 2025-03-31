import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroArrowRightOnRectangle, heroBell, heroBookmarkSquare, heroChartPie, heroChevronDown, heroCog6Tooth, heroCubeTransparent, heroDocumentPlus, heroHome, heroMagnifyingGlass, heroShieldExclamation, heroUser } from '@ng-icons/heroicons/outline';
import { heroEllipsisVerticalSolid, heroPlusSolid } from '@ng-icons/heroicons/solid';
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule, SCNGXToolbarModule } from '@repo/angular-ui';
import { SCSDKImportModule } from '@repo/angular-sdk';
import { NavListItemModule } from 'src/app/components/list-items/nav-list-item/nav-list-item.module';
import { ProfileBarModule } from 'src/app/components/profile-bar/profile-bar.module';
import { AdminLayoutComponent } from './admin-layout.component';

@NgModule({
  declarations: [
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ProfileBarModule,
    NavListItemModule,

    SCNGXDrawerModule,
    SCNGXBottomNavModule,
    SCNGXProgressbarModule,
    SCNGXToolbarModule,

    SCSDKImportModule,

    NgIconsModule.withIcons({
      heroHome,
      heroMagnifyingGlass,
      heroUser,
      heroBookmarkSquare,
      heroChevronDown,
      heroPlusSolid,
      heroBell,
      heroEllipsisVerticalSolid,
      heroCog6Tooth,
      heroArrowRightOnRectangle,
      heroShieldExclamation,
      heroCubeTransparent,
      heroDocumentPlus,
      heroChartPie
    })
  ]
})
export class AdminLayoutModule { }
