import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBarComponent } from './profile-bar.component';
import { RouterModule } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';

@NgModule({
  declarations: [
    ProfileBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgIconsModule.withIcons({ heroChevronDown }),
  ],
  exports: [
    ProfileBarComponent
  ]
})
export class ProfileBarModule { }
