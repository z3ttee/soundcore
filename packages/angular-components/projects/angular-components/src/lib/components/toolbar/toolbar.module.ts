import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXToolbarComponent } from './toolbar.component';
import { HeroIconModule, chevronDown } from 'ng-heroicon';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [
    SCNGXToolbarComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ chevronDown }),
    MatRippleModule
  ],
  exports: [
    SCNGXToolbarComponent
  ]
})
export class SCNGXToolbarModule { }
