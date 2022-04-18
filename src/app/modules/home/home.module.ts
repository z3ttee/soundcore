import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXScreenModule, SCNGXTooltipModule } from "soundcore-ngx";
import { HomeComponent } from './views/home/home.component';

const routes: Routes = [
    { path: "", component: HomeComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SCNGXScreenModule,
        SCNGXTooltipModule
    ],
    declarations: [
      HomeComponent
    ]
})
export class HomeModule {}