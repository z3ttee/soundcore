import { NgModule } from "@angular/core";
import { AscMainLayoutComponent } from "./main-layout.component";
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule, SCNGXScrollingModule } from "@soundcore/ngx"
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { SCSDKPlaylistModule, SCSDKSearchModule } from "@soundcore/sdk";
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ProfileBarModule } from "src/app/components/profile-bar/profile-bar.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AppPlaylistCreateDialogModule } from "src/app/dialogs/playlist-create-dialog/playlist-create-dialog.module";
import { AppPlayerModule } from "src/app/modules/player/player.module";
import { SCNGXPlaylistListItemModule } from "src/app/components/list-items/playlist-list-item/playlist-list-item.module";
import { NgIconsModule } from '@ng-icons/core';
import { heroPlusSolid } from '@ng-icons/heroicons/solid';
import { heroHome, heroArrowRightOnRectangle, heroCog6Tooth, heroBell, heroMagnifyingGlass, heroUser, heroBookmarkSquare, heroChevronDown, heroBolt, heroCubeTransparent, heroArrowLeft } from '@ng-icons/heroicons/outline';
import { NavListItemModule } from "src/app/components/list-items/nav-list-item/nav-list-item.module";

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
export class AscMainLayoutModule {}