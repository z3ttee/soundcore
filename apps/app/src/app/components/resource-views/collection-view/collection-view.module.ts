import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCNGXCollectionViewComponent } from "./collection-view.component";

@NgModule({
    declarations: [
        SCNGXCollectionViewComponent
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        SCNGXCollectionViewComponent
    ]
})
export class SCNGXCollectionViewModule {}