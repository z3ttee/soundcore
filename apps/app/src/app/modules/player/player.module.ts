import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatRippleModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";
import { SCNGXArtworkModule, SCNGXExplicitBadgeModule, SCNGXIconBtnModule } from "@soundcore/ngx";
import { SCSDKCollectionModule, SCSDKStreamModule } from "@soundcore/sdk";
import { SCNGXRangeModule } from "src/app/components/inputs/range/range.module";
import { SCNGXSeekerModule } from "src/app/components/inputs/seeker";
import { AppDurationPipeModule } from "src/app/pipes/duration/duration-pipe.module";
import { AppPlayerBarComponent } from "./components/player-bar/player-bar.component";

import { NgIconsModule } from "@ng-icons/core";
import { heroSpeakerWave, heroSpeakerXMark, heroHeart, heroForward, heroRectangleStack, heroArrowsPointingOut } from "@ng-icons/heroicons/outline";
import { heroHeartSolid } from "@ng-icons/heroicons/solid";
import { AudioQueue } from "./services/queue.service";
import { AudioController } from "./services/controls.service";
import { PlayerService } from "./services/player.service";

// const queueInstance = new AudioQueue([]);
// const controllerInstance = new AudioController(new Audio());
// const playerInstance = new PlayerService(queueInstance, controllerInstance);

@NgModule({
    declarations: [
        AppPlayerBarComponent
    ],
    providers: [
        // {
        //     provide: AudioQueue,
        //     useValue: queueInstance
        // },
        // {
        //     provide: AudioController,
        //     useValue: controllerInstance
        // },
        // {
        //     provide: PlayerService,

        // }
    ],
    imports: [
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        NgIconsModule.withIcons({ heroSpeakerWave, heroSpeakerXMark, heroHeart, heroHeartSolid, heroForward, heroRectangleStack, heroArrowsPointingOut }),

        MatRippleModule,
        MatSnackBarModule,

        AppDurationPipeModule,

        SCNGXArtworkModule,
        SCNGXExplicitBadgeModule,
        SCNGXSeekerModule,
        SCNGXIconBtnModule,
        SCNGXRangeModule,

        SCSDKCollectionModule,
        SCSDKStreamModule
    ],
    exports: [
        AppPlayerBarComponent
    ]
})
export class AppPlayerModule {}