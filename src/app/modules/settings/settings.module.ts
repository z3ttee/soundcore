import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXScreenModule } from "soundcore-ngx";
import { SettingsComponent } from './views/settings/settings.component';

const routes: Routes = [
    { path: "", component: SettingsComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SCNGXScreenModule
    ],
    declarations: [
      SettingsComponent
    ]
})
export class SettingsModule {}