import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXTabbarComponent } from './tabbar.component';
import { SCNGXTabItemComponent } from './tab-item/tab-item.component';
import { RouterModule } from '@angular/router';
import { SCNGXScreenModule } from "../../../services/screen/screen.module"

@NgModule({
  declarations: [
    SCNGXTabbarComponent,
    SCNGXTabItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SCNGXScreenModule
  ],
  exports: [
    SCNGXTabbarComponent,
    SCNGXTabItemComponent
  ]
})
export class SCNGXTabbarModule { }
