import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCNGXDrawerComponent } from './drawer.component';
import { HeroIconModule, chevronRight } from 'ng-heroicon';
import { SCNGXScreenModule } from "../../services/screen/screen.module";
import { SCNGXNavListItemModule } from "../list/nav-list-item/nav-list-item.module";

@NgModule({
  declarations: [
    SCNGXDrawerComponent
  ],
  imports: [
    CommonModule,
    HeroIconModule.withIcons({ chevronRight }, { defaultHostDisplay: 'inlineBlock', attachDefaultDimensionsIfNoneFound: true }),
    SCNGXScreenModule,
    SCNGXNavListItemModule
  ],
  exports: [
    SCNGXDrawerComponent,
    SCNGXNavListItemModule
  ]
})
export class SCNGXDrawerModule {}