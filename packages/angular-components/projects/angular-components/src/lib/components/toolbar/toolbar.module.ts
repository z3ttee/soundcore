import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { NgIconsModule } from '@ng-icons/core';
import { heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { SCNGXToolbarComponent } from './toolbar.component';

@NgModule({
  declarations: [
    SCNGXToolbarComponent
  ],
  imports: [
    NgIconsModule.withIcons({ heroChevronDownSolid }),
    CommonModule,
    MatRippleModule
  ],
  exports: [
    SCNGXToolbarComponent
  ]
})
export class SCNGXToolbarModule { }
