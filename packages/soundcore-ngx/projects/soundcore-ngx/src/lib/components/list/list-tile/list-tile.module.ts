import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCNGXButtonModule } from "../../buttons";
import { SCNGXListTileComponent } from "./list-tile.component";

@NgModule({
    declarations: [
        SCNGXListTileComponent
    ],
    imports: [
        CommonModule,
        SCNGXButtonModule
    ],
    exports: [
        SCNGXListTileComponent
    ]
})
export class SCNGXListTileModule {

}