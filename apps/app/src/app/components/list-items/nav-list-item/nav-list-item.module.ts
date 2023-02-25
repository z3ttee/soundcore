import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { SCNGXArtworkModule } from "@soundcore/ngx";
import { NavListItemComponent } from "./nav-list-item.component";

@NgModule({
    declarations: [
        NavListItemComponent
    ],
    imports: [
        CommonModule,
        NgIconsModule,
        RouterModule,
        SCNGXArtworkModule
    ],
    exports: [
        NavListItemComponent
    ]
})
export class NavListItemModule {}