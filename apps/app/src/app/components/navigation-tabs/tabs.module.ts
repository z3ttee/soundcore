import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SCNGXTabBodyComponent } from "./tab-body/tab-body.component";
import { SCNGXTabItemComponent } from "./tab-item/tab-item.component";
import { SCNGXTabsComponent } from "./tabs.component";

@NgModule({
    declarations: [
        SCNGXTabsComponent,
        SCNGXTabItemComponent,
        SCNGXTabBodyComponent
    ],
    imports: [
        CommonModule,
        RouterModule
    ],
    exports: [
        SCNGXTabsComponent,
        SCNGXTabItemComponent,
        SCNGXTabBodyComponent
    ]
})
export class SCNGXTabsModule {}