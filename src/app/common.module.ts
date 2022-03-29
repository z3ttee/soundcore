import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PipesModule } from "./pipes/pipes.module";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        CommonModule,
        PipesModule,
        RouterModule
    ],
    declarations: [
    ],
    exports: [
    ]
})
export class AppCommonModule {}