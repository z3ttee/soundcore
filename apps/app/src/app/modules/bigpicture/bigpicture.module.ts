import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { featherShuffle } from "@ng-icons/feather-icons";
import { heroArrowPathRoundedSquare, heroBackward, heroChevronDown, heroForward, heroHeart, heroRectangleStack } from "@ng-icons/heroicons/outline";
import { heroHeartSolid, heroPauseSolid, heroPlaySolid, heroXMarkSolid } from "@ng-icons/heroicons/solid";

import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule } from "@repo/angular-components";
import { SCNGXRangeModule } from "src/app/components/inputs/range/range.module";
import { SCNGXSeekerModule } from "src/app/components/inputs/seeker";
import { AppDurationPipeModule } from "src/app/pipes/duration/duration-pipe.module";
import { PlayableEntityTypePipeModule } from "src/app/pipes/playableEntity/playableEntityType.module";
import { BigPictureComponent } from "./views/bigpicture/bigpicture.component";

const routes: Routes = [
    { path: "", component: BigPictureComponent },
    { path: "**", redirectTo: "/" }
];

@NgModule({
    declarations: [
        BigPictureComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgIconsModule.withIcons({ heroXMarkSolid, heroForward, heroBackward, heroRectangleStack, heroHeart, heroHeartSolid, heroChevronDown, heroArrowPathRoundedSquare, heroPlaySolid, heroPauseSolid, featherShuffle }),

        MatSnackBarModule,

        SCNGXIconBtnModule,
        SCNGXArtworkModule,
        SCNGXExplicitBadgeModule,
        SCNGXSeekerModule,
        SCNGXRangeModule,
        AppDurationPipeModule,
        PlayableEntityTypePipeModule
    ],
    exports: [
        BigPictureComponent
    ]
})
export class BigPictureModule { }