import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCNGXChipsComponent } from "./chips.component";
import { NgIconsModule } from "@ng-icons/core";
import { heroXMark } from "@ng-icons/heroicons/outline";

@NgModule({
    declarations: [
        SCNGXChipsComponent
    ],
    imports: [
        CommonModule,
        NgIconsModule.withIcons({ heroXMark })
    ],
    exports: [
        SCNGXChipsComponent
    ]
})
export class SCNGXChipsModule {}