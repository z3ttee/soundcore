import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCNGXDrawerComponent } from './drawer.component';
import { HeroIconModule, chevronRight } from 'ng-heroicon';

@NgModule({
  declarations: [
    SCNGXDrawerComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ chevronRight }, { defaultHostDisplay: 'inlineBlock', attachDefaultDimensionsIfNoneFound: true }),
  ],
  exports: [
    SCNGXDrawerComponent,
  ]
})
export class SCNGXDrawerModule {}