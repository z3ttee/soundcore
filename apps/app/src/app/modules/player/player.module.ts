import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatRippleModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { heroSpeakerWave, heroSpeakerXMark } from "@ng-icons/heroicons/outline";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule } from "@soundcore/ngx";
import { SCSDKCollectionModule } from "@soundcore/sdk";
import { arrowsExpand, collection, fastForward, heart, HeroIconModule } from "ng-heroicon";
import { SCNGXRangeComponent } from "src/app/components/inputs/range";
import { SCNGXRangeModule } from "src/app/components/inputs/range/range.module";
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
        HeroIconModule.withIcons({ arrowsExpand, collection, fastForward, heart }),
        NgIconsModule.withIcons({ heroSpeakerWave, heroSpeakerXMark }),

        MatRippleModule,
        MatSnackBarModule,

        AppDurationPipeModule,

        SCNGXArtworkModule,
        SCNGXExplicitBadgeModule,
        SCNGXSeekerModule,
        SCNGXIconBtnModule,
        SCNGXRangeModule,

        SCSDKCollectionModule
    ],
    exports: [
        AppPlayerBarComponent
    ]
})
export class AppPlayerModule {}