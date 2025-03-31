import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatRippleModule } from "@angular/material/core";
import { RouterModule, Routes } from "@angular/router";
import { NgIconsModule } from '@ng-icons/core';
import { heroBell } from '@ng-icons/heroicons/outline';
import { SCNGXLabelModule, SCNGXToolbarModule, SCNGXTooltipModule } from "@repo/angular-ui";
import { HomeComponent } from './views/home/home.component';

const routes: Routes = [
    { path: "", component: HomeComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SCNGXTooltipModule,
        SCNGXToolbarModule,

        NgIconsModule.withIcons({ heroBell }),
        MatRippleModule,

        SCNGXLabelModule,
    ],
    declarations: [
        HomeComponent
    ]
})
export class HomeModule { }