import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { PlaylistListItemComponent } from "./components/list-items/playlist-list-item/playlist-list-item.component";
import { MessageComponent } from "./components/message/message.component";
import { PipesModule } from "./pipes/pipes.module";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        CommonModule,
        PipesModule,
        RouterModule
    ],
    declarations: [
        ErrorMessageComponent,
        MessageComponent,

        PlaylistListItemComponent,
    ],
    exports: [
        ErrorMessageComponent,
        MessageComponent,

        PlaylistListItemComponent,
    ]
})
export class AppCommonModule {}