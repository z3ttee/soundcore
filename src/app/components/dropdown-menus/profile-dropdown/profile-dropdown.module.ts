import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscProfileDropdownComponent } from './profile-dropdown.component';
import { AscContextMenuTemplateModule } from '../../context-menus/context-menu-template/context-menu-template.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AscProfileDropdownComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AscContextMenuTemplateModule
  ],
  exports: [
    AscProfileDropdownComponent
  ]
})
export class AscProfileDropdownModule { }
