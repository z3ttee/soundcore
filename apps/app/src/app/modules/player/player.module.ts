import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatRippleModule } from "@angular/material/core";
import { RouterModule } from "@angular/router";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule } from "@soundcore/ngx";
import { arrowsExpand, collection, fastForward, HeroIconModule } from "ng-heroicon";
import { SCNGXSeekerModule } from "src/app/components/inputs/seeker";
import { AppDurationPipeModule } from "src/app/pipes/duration/duration-pipe.module";
import { AppPlayerBarComponent } from "./components/player-bar/player-bar.component";

@NgModule({
    declarations: [
        AppPlayerBarComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        HeroIconModule.withIcons({ arrowsExpand, collection, fastForward }),

        MatRippleModule,

        AppDurationPipeModule,

        SCNGXArtworkModule,
        SCNGXExplicitBadgeModule,
        SCNGXSeekerModule
    ],
    exports: [
        AppPlayerBarComponent
    ]
})
export class AppPlayerModule {}