import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { heroXMarkSolid } from '@ng-icons/heroicons/solid';
import { SCNGXButtonModule } from '../components/buttons/btn/btn.module';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { DialogContainerComponent } from './components/dialog-container/dialog-container.component';
import { SCNGXDialogSectionComponent } from './components/dialog-section/dialog-section.component';
import { SCNGXDialogComponent } from './components/template/template.component';

@NgModule({
  declarations: [
    SCNGXDialogComponent,
    SCNGXDialogSectionComponent,
    DialogContainerComponent,
    DialogConfirmComponent
  ],
  imports: [
    NgIconsModule.withIcons({ heroXMarkSolid }),
    CommonModule,
    SCNGXButtonModule
  ],
  exports: [
    SCNGXDialogComponent,
    SCNGXDialogSectionComponent
  ]
})
export class SCNGXDialogModule { }
