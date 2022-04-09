import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXScreenModule } from "soundcore-ngx";
import { HomeComponent } from './views/home/home.component';

const routes: Routes = [
    { path: "", component: HomeComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SCNGXScreenModule
    ],
    declarations: [
      HomeComponent
    ]
})
export class HomeModule {}