import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCSDKSettingsModule } from "@repo/angular-sdk";

import { ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SettingsComponent } from './views/settings/settings.component';

const routes: Routes = [
    { path: "", component: SettingsComponent }
]

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),

        SCSDKSettingsModule,

        MatCheckboxModule
    ],
    declarations: [
        SettingsComponent
    ]
})
export class SettingsModule { }