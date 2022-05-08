import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXScreenModule } from "soundcore-ngx";
import { SCSDKSettingsModule } from "soundcore-sdk";

import { SettingsComponent } from './views/settings/settings.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ReactiveFormsModule } from "@angular/forms";

const routes: Routes = [
    { path: "", component: SettingsComponent }
]

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        
        SCNGXScreenModule,
        SCSDKSettingsModule,

        MatCheckboxModule
    ],
    declarations: [
      SettingsComponent
    ]
})
export class SettingsModule {}