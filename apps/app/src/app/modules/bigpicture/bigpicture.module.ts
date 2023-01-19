import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { heroXMarkSolid, heroHeartSolid } from "@ng-icons/heroicons/solid";
import { heroForward, heroBackward, heroRectangleStack, heroHeart } from "@ng-icons/heroicons/outline";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule } from "@soundcore/ngx";
import { SCNGXRangeModule } from "src/app/components/inputs/range/range.module";
import { SCNGXSeekerModule } from "src/app/components/inputs/seeker";
import { AppDurationPipeModule } from "src/app/pipes/duration/duration-pipe.module";
import { BigPictureComponent } from "./views/bigpicture/bigpicture.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";

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
        NgIconsModule.withIcons({ heroXMarkSolid, heroForward, heroBackward, heroRectangleStack, heroHeart, heroHeartSolid }),

        MatSnackBarModule,

        SCNGXIconBtnModule,
        SCNGXArtworkModule,
        SCNGXExplicitBadgeModule,
        SCNGXSeekerModule,
        SCNGXRangeModule,
        AppDurationPipeModule
    ],
    exports: [
        BigPictureComponent
    ]
})
export class BigPictureModule {}