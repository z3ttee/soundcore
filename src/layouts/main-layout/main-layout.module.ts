import { NgModule } from "@angular/core";
import { AscMainLayoutComponent } from "./main-layout.component";
import { SCNGXDrawerModule } from "soundcore-ngx"
import { RouterModule } from "@angular/router";

@NgModule({
    declarations: [
        AscMainLayoutComponent
    ],
    imports: [
        RouterModule,
        SCNGXDrawerModule
    ],
    exports: [
        AscMainLayoutComponent
    ]
})
export class AscMainLayoutModule {}