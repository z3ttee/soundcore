import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { ProfileBarModule } from 'src/app/components/profile-bar/profile-bar.module';
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule, SCNGXToolbarModule } from '@soundcore/ngx';
import { SCSDKImportModule } from '@soundcore/sdk';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlusSolid, heroEllipsisVerticalSolid } from '@ng-icons/heroicons/solid';
import { heroHome, heroShieldExclamation, heroCubeTransparent, heroArrowRightOnRectangle, heroCog6Tooth, heroDocumentPlus, heroChartPie, heroBell, heroMagnifyingGlass, heroUser, heroBookmarkSquare, heroChevronDown } from '@ng-icons/heroicons/outline';
import { NavListItemModule } from 'src/app/components/list-items/nav-list-item/nav-list-item.module';

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
