import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXBottomNavComponent } from './bottom-nav.component';
import { SCNGXNavItemComponent } from './item-component/item-component.component';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [
    SCNGXBottomNavComponent,
    SCNGXNavItemComponent
  ],
  imports: [
    CommonModule,

    MatRippleModule
  ],
  exports: [
    SCNGXBottomNavComponent,
    SCNGXNavItemComponent
  ]
})
export class SCNGXBottomNavModule { }
