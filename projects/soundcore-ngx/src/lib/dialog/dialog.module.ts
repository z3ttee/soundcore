import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackdropComponent } from './components/backdrop/backdrop.component';
import { SCNGXDialogSectionComponent } from './components/dialog-section/dialog-section.component';
import { SCNGXDialogService } from './services/dialog.service';

@NgModule({
  declarations: [
    BackdropComponent,
    SCNGXDialogSectionComponent
  ],
  providers: [
    SCNGXDialogService
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    SCNGXDialogSectionComponent
  ]
})
export class SCNGXDialogModule { }
