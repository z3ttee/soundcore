import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCCDKOverlayComponent } from './overlay.component';

@NgModule({
    declarations: [
        SCCDKOverlayComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SCCDKOverlayComponent
    ]
})
export class SCCDKOverlayModule {}