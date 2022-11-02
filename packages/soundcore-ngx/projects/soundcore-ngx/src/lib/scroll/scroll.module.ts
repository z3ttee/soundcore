import { NgModule } from "@angular/core";
import { UiScrollModule } from "ngx-ui-scroll";
import { SCNGXScrollWrapperComponent } from "./components/scroll-wrapper.component";

@NgModule({
    declarations: [
        SCNGXScrollWrapperComponent
    ],
    imports: [
        UiScrollModule
    ],
    exports: [
        SCNGXScrollWrapperComponent,
        UiScrollModule
    ]
})
export class SCNGXScrollModule {}