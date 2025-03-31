import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatRippleModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXUiRowModule, SCNGXUiTitleModule } from "@repo/angular-components";
import { SCSDKCollectionModule, SCSDKStreamModule } from "@repo/angular-sdk";
import { SCNGXRangeModule } from "src/app/components/inputs/range/range.module";
import { SCNGXSeekerModule } from "src/app/components/inputs/seeker";
import { AppDurationPipeModule } from "src/app/pipes/duration/duration-pipe.module";
import { AppPlayerBarComponent } from "./components/player-bar/player-bar.component";

import { NgIconsModule } from "@ng-icons/core";
import { featherShuffle } from "@ng-icons/feather-icons";
import { heroArrowsPointingOut, heroForward, heroHeart, heroRectangleStack, heroSpeakerWave, heroSpeakerXMark } from "@ng-icons/heroicons/outline";
import { heroHeartSolid, heroPauseSolid, heroPlaySolid } from "@ng-icons/heroicons/solid";
import { EmptyPageBannerModule } from "src/app/components/banners/empty-page-banner";
import { SCNGXSongListItemModule } from "src/app/components/list-items/song-list-item/song-list-item.module";
import { SongListModule } from "src/app/components/lists/song-list/song-list.module";
import { SCNGXTabsModule } from "src/app/components/navigation-tabs";
import { QueueIndexViewComponent } from "./views/queue-view/index-view.component";
import { QueueHistoryViewComponent } from "./views/queue-view/tabs/history-view/history-view.component";
import { QueueViewComponent } from "./views/queue-view/tabs/queue-view/queue-view.component";

const routes: Routes = [
    {
        path: "queue", component: QueueIndexViewComponent, children: [
            { path: "", component: QueueViewComponent },
            { path: "history", component: QueueHistoryViewComponent },
        ]
    },
]

@NgModule({
    declarations: [
        AppPlayerBarComponent,
        QueueIndexViewComponent,
        QueueHistoryViewComponent,
        QueueViewComponent,
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
        SCNGXTabsModule,

        EmptyPageBannerModule,

        SCNGXUiTitleModule,
        SCNGXUiRowModule,

        SCSDKCollectionModule,
        SCSDKStreamModule,

        SCNGXSongListItemModule,
        SongListModule
    ],
    exports: [
        AppPlayerBarComponent
    ]
})
export class AppPlayerModule { }