import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SCNGXChipsComponent } from "./chips.component";

@NgModule({
    declarations: [
        SCNGXChipsComponent
    ],
    imports: [
        CommonModule,
        FontAwesomeModule
    ],
    exports: [
        SCNGXChipsComponent
    ]
})
export class SCNGXChipsModule {
    constructor(private readonly library: FaIconLibrary) {
        library.addIcons(faXmark)
    }
}