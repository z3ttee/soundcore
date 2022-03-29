import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscToolbarComponent } from './toolbar.component';
import { AscProfileBadgeModule } from "../badge-components/profile-badge/profile-badge.module"
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TeleportModule } from '@ngneat/overview';
import { MatButtonModule } from '@angular/material/button';
import { AscImageModule } from '../image-components/image-components.module';
import { AscProfileDropdownModule } from '../dropdown-menus/profile-dropdown/profile-dropdown.module';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [
    AscToolbarComponent
  ],
  imports: [
    CommonModule,
    AscProfileBadgeModule,
    AscImageModule,
    AscProfileDropdownModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    TeleportModule
  ],
  exports: [
    AscToolbarComponent
  ]
})
export class AscToolbarModule { }
