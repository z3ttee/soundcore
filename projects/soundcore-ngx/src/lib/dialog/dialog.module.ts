import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXDialogComponent } from './components/template/template.component';
import { SCNGXDialogSectionComponent } from './components/dialog-section/dialog-section.component';
import { SCNGXDialogService } from './services/dialog.service';
import { HeroIconModule, x } from 'ng-heroicon';
import { DialogContainerComponent } from './components/dialog-container/dialog-container.component';

@NgModule({
  declarations: [
    SCNGXDialogComponent,
    SCNGXDialogSectionComponent,
    DialogContainerComponent
  ],
  providers: [
    SCNGXDialogService
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ x })
  ],
  exports: [
    SCNGXDialogComponent,
    SCNGXDialogSectionComponent
  ]
})
export class SCNGXDialogModule { }
