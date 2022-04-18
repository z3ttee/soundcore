import { NgModule } from "@angular/core";
import { AscMainLayoutComponent } from "./main-layout.component";
import { SCNGXBottomNavModule, SCNGXDrawerModule, SCNGXProgressbarModule } from "soundcore-ngx"
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HeroIconModule, home, search, user, bookmarkAlt, chevronDown } from "ng-heroicon";
import { SCDKPlaylistModule } from "soundcore-sdk";
import { SCNGXPlaylistListItemModule } from "projects/soundcore-ngx/src/public-api";
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ProfileBarModule } from "src/app/components/profile-bar/profile-bar.module";

@NgModule({
    declarations: [
        AscMainLayoutComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        DragDropModule,
        ProfileBarModule,
        
        SCNGXDrawerModule,
        SCNGXBottomNavModule,
        SCNGXPlaylistListItemModule,
        SCNGXProgressbarModule,

        SCDKPlaylistModule,


        HeroIconModule.withIcons({ home, search, user, bookmarkAlt, chevronDown }, { defaultHostDisplay: 'inlineBlock', attachDefaultDimensionsIfNoneFound: true })
    ],
    exports: [
        AscMainLayoutComponent
    ]
})
export class AscMainLayoutModule {}