import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXDialogComponent } from './components/template/template.component';
import { SCNGXDialogSectionComponent } from './components/dialog-section/dialog-section.component';
import { HeroIconModule, x } from 'ng-heroicon';
import { DialogContainerComponent } from './components/dialog-container/dialog-container.component';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { SCNGXButtonModule } from '../components/buttons/btn/btn.module';

@NgModule({
  declarations: [
    SCNGXDialogComponent,
    SCNGXDialogSectionComponent,
    DialogContainerComponent,
    DialogConfirmComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ x }),
    SCNGXButtonModule
  ],
  exports: [
    SCNGXDialogComponent,
    SCNGXDialogSectionComponent
  ]
})
export class SCNGXDialogModule { }
