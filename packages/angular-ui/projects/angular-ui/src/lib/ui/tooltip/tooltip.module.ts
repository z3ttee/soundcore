import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXTooltipDirective } from './directive/tooltip.directive';
import { SCNGXTooltipComponent } from './components/tooltip.component';

@NgModule({
  declarations: [
    SCNGXTooltipDirective,
    SCNGXTooltipComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SCNGXTooltipDirective
  ]
})
export class SCNGXTooltipModule { }
