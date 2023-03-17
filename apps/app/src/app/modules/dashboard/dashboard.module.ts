import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXBytesPipeModule, SCNGXUiRowModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKMetricsModule } from "@soundcore/sdk";
import { DashboardIndexView } from "./views/dashboard-index/dashboard-index.component";

const routes: Routes = [
    { path: "", component: DashboardIndexView }
]

@NgModule({
    declarations: [
        DashboardIndexView
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        SCNGXUiRowModule,
        SCNGXUiTitleModule,
        SCNGXBytesPipeModule,

        SCSDKMetricsModule
    ]
})
export class DashboardModule {

}