import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXUiRowModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCNGXTabsModule } from "src/app/components/navigation-tabs";
import { ConfigurateGeneralView } from "./views/configurate-general/configurate-general.component";
import { ConfigurateIndexView } from "./views/configurate-index/configurate-index.component";
import { ConfigurateResetView } from "./views/configurate-reset/configurate-reset.component";

const routes: Routes = [
    { path: "", component: ConfigurateIndexView, children: [
        { path: "", component: ConfigurateGeneralView },
        { path: "reset", component: ConfigurateResetView }

    ] },
]

@NgModule({
    declarations: [
        ConfigurateIndexView,
        ConfigurateGeneralView,
        ConfigurateResetView
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        SCNGXUiTitleModule,
        SCNGXUiRowModule,
        SCNGXTabsModule
    ]
})
export class ConfigurateModule {}