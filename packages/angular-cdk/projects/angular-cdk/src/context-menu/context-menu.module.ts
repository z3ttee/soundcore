import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { OverlayModule } from '@repo/angular-cdk/overlay';
import { SCCDKContextMenuCategoryComponent } from './components/context-menu-category/context-menu-category.component';
import { SCCDKContextMenuContainerComponent } from './components/context-menu-container/context-menu-container.component';
import { SCCDKContextMenuItemComponent } from './components/context-menu-item/context-menu-item.component';
import { SCCDKContextMenuComponent } from './components/context-menu/context-menu.component';
import { SCCDKContextMenuDirective } from './directive/context-menu.directive';
import { SCCDKContextService } from './services/context-menu.service';

@NgModule({
  declarations: [
    SCCDKContextMenuDirective,
    SCCDKContextMenuItemComponent,
    SCCDKContextMenuComponent,
    SCCDKContextMenuCategoryComponent,
    SCCDKContextMenuContainerComponent
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
    SCCDKContextMenuCategoryComponent,
    SCCDKContextMenuContainerComponent
  ]
})
export class SCCDKContextMenuModule { }
