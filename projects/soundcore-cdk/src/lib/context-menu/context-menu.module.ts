import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCCDKContextMenuDirective } from './directive/context-menu.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { SCCDKContextService } from './services/context-menu.service';
import { SCCDKContextMenuContainerComponent } from './components/context-menu-container/context-menu-container.component';

@NgModule({
  declarations: [
    SCCDKContextMenuDirective,
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
    SCCDKContextMenuContainerComponent
  ]
})
export class SCCDKContextMenuModule { }
