import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgIconsModule } from '@ng-icons/core';
import { heroArrowLeft, heroArrowRightOnRectangle, heroBell, heroBolt, heroBookmarkSquare, heroChevronDown, heroCog6Tooth, heroHome, heroMagnifyingGlass, heroUser } from '@ng-icons/heroicons/outline';
import { heroPlusSolid } from '@ng-icons/heroicons/solid';
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule, SCNGXScrollingModule } from "@repo/angular-ui";
import { SCSDKPlaylistModule, SCSDKSearchModule } from "@repo/angular-sdk";
import { NavListItemModule } from "src/app/components/list-items/nav-list-item/nav-list-item.module";
import { SCNGXPlaylistListItemModule } from "src/app/components/list-items/playlist-list-item/playlist-list-item.module";
import { ProfileBarModule } from "src/app/components/profile-bar/profile-bar.module";
import { AppPlaylistCreateDialogModule } from "src/app/dialogs/playlist-create-dialog/playlist-create-dialog.module";
import { AppPlayerModule } from "src/app/modules/player/player.module";
import { AscMainLayoutComponent } from "./main-layout.component";

@NgModule({
    declarations: [
        AscMainLayoutComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        DragDropModule,
        ProfileBarModule,
        NavListItemModule,

        SCNGXDrawerModule,
        SCNGXBottomNavModule,
        SCNGXPlaylistListItemModule,
        SCNGXProgressbarModule,
        SCNGXScrollingModule,

        SCSDKSearchModule,
        SCSDKPlaylistModule,

        AppPlaylistCreateDialogModule,
        AppPlayerModule,

        NgIconsModule.withIcons({
            heroHome,
            heroMagnifyingGlass,
            heroUser,
            heroBookmarkSquare,
            heroChevronDown,
            heroPlusSolid,
            heroArrowLeft,
            heroBolt,
            heroBell,
            heroCog6Tooth,
            heroArrowRightOnRectangle
        })
    ],
    exports: [
        AscMainLayoutComponent
    ]
})
export class AscMainLayoutModule { }