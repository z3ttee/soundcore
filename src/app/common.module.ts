import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { LabelComponent } from "./components/label/label.component";
import { PlaylistListItemComponent } from "./components/list-items/playlist-list-item/playlist-list-item.component";
import { MessageComponent } from "./components/message/message.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ErrorMessageComponent,
        MessageComponent,
        LabelComponent,

        PlaylistListItemComponent
    ],
    exports: [
        ErrorMessageComponent,
        MessageComponent,
        LabelComponent,

        PlaylistListItemComponent
    ]
})
export class AppCommonModule {}