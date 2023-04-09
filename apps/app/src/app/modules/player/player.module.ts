import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatRippleModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXUiRowModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKCollectionModule, SCSDKStreamModule } from "@soundcore/sdk";
import { SCNGXRangeModule } from "src/app/components/inputs/range/range.module";
import { SCNGXSeekerModule } from "src/app/components/inputs/seeker";
import { AppDurationPipeModule } from "src/app/pipes/duration/duration-pipe.module";
import { AppPlayerBarComponent } from "./components/player-bar/player-bar.component";

import { NgIconsModule } from "@ng-icons/core";
import { heroSpeakerWave, heroSpeakerXMark, heroHeart, heroForward, heroRectangleStack, heroArrowsPointingOut } from "@ng-icons/heroicons/outline";
import { heroHeartSolid, heroPlaySolid, heroPauseSolid } from "@ng-icons/heroicons/solid";
import { featherShuffle } from "@ng-icons/feather-icons";
import { QueueViewComponent } from "./views/queue-view/queue-view.component";
import { SCNGXSongListItemModule } from "src/app/components/list-items/song-list-item/song-list-item.module";

const routes: Routes = [
    { path: "queue", component: QueueViewComponent },
]

@NgModule({
    declarations: [
        AppPlayerBarComponent,
        QueueViewComponent
    ],
    providers: [],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        ReactiveFormsModule,
        NgIconsModule.withIcons({ heroSpeakerWave, heroSpeakerXMark, heroHeart, heroHeartSolid, heroForward, heroRectangleStack, heroArrowsPointingOut, heroPlaySolid, heroPauseSolid, featherShuffle }),

        MatRippleModule,
        MatSnackBarModule,

        AppDurationPipeModule,

        SCNGXArtworkModule,
        SCNGXExplicitBadgeModule,
        SCNGXSeekerModule,
        SCNGXIconBtnModule,
        SCNGXRangeModule,
        SCNGXScrollingModule,

        SCNGXUiTitleModule,
        SCNGXUiRowModule,

        SCSDKCollectionModule,
        SCSDKStreamModule,

        SCNGXSongListItemModule
    ],
    exports: [
        AppPlayerBarComponent
    ]
})
export class AppPlayerModule {}