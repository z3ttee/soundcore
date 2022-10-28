import { NgModule } from "@angular/core";
import { AscMainLayoutComponent } from "./main-layout.component";
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule, SCNGXPlaylistListItemModule } from "@soundcore/ngx"
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HeroIconModule, home, search, user, bookmarkAlt, chevronDown, plus, shieldExclamation, bell, cog, logout } from "ng-heroicon";
import { SCDKSearchModule } from "@soundcore/sdk";
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ProfileBarModule } from "src/app/components/profile-bar/profile-bar.module";
import { PlayerBarModule } from "src/app/components/player-bar/player-bar.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AppPlaylistCreateDialogModule } from "src/app/dialogs/playlist-create-dialog/playlist-create-dialog.module";

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
        PlayerBarModule,
        
        SCNGXDrawerModule,
        SCNGXBottomNavModule,
        SCNGXPlaylistListItemModule,
        SCNGXProgressbarModule,

        SCDKSearchModule,

        AppPlaylistCreateDialogModule,

        HeroIconModule.withIcons({ home, search, user, bookmarkAlt, chevronDown, plus, shieldExclamation, bell, cog, logout }, { defaultHostDisplay: 'inlineBlock', attachDefaultDimensionsIfNoneFound: true })
    ],
    exports: [
        AscMainLayoutComponent
    ]
})
export class AscMainLayoutModule {}