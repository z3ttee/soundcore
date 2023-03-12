import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { heroArrowUturnLeft } from "@ng-icons/heroicons/outline";

import { SCNGXButtonModule, SCNGXDialogModule, SCNGXListTileModule, SCNGXUiRowModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKConfigureModule } from "@soundcore/sdk";
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
        NgIconsModule.withIcons({ heroArrowUturnLeft }),

        SCNGXUiTitleModule,
        SCNGXUiRowModule,
        SCNGXTabsModule,
        SCNGXButtonModule,
        SCNGXListTileModule,
        SCNGXDialogModule,

        SCSDKConfigureModule
    ]
})
export class ConfigurateModule {}