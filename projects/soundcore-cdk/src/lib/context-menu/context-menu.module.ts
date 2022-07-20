import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCCDKContextMenuDirective } from './directive/context-menu.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { SCCDKContextService } from './services/context-menu.service';
import { SCCDKContextMenuItemComponent } from './components/context-menu-item/context-menu-item.component';
import { SCCDKContextMenuComponent } from './components/context-menu/context-menu.component';
import { SCCDKContextMenuCategoryComponent } from './components/context-menu-category/context-menu-category.component';

@NgModule({
  declarations: [
    SCCDKContextMenuDirective,
    SCCDKContextMenuItemComponent,
    SCCDKContextMenuComponent,
    SCCDKContextMenuCategoryComponent
  ],
  imports: [
    CommonModule,
    OverlayModule,
    MatBottomSheetModule
  ],
  providers: [
    SCCDKContextService
  ],
  exports: [
    SCCDKContextMenuDirective,
    SCCDKContextMenuComponent,
    SCCDKContextMenuItemComponent,
    SCCDKContextMenuCategoryComponent
  ]
})
export class SCCDKContextMenuModule { }
