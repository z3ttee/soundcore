import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatRippleModule } from "@angular/material/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXLabelModule, SCNGXToolbarModule, SCNGXTooltipModule } from "@soundcore/ngx";
import { HomeComponent } from './views/home/home.component';
import { NgIconsModule } from '@ng-icons/core';
import { heroBell } from '@ng-icons/heroicons/outline';

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
export class HomeModule {}