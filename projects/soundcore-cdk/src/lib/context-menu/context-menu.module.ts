import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCCDKContextMenuDirective } from './directive/context-menu.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { SCCDKContextService } from './services/context-menu.service';

@NgModule({
  declarations: [
    SCCDKContextMenuDirective
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
    SCCDKContextMenuDirective
  ]
})
export class SCCDKContextMenuModule { }
