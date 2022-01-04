import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { ShowcaseItemComponent } from "./components/items/showcase-item/showcase-item.component";
import { MessageComponent } from "./components/message/message.component";
import { SongArtistsPipe } from "./pipes/song-artists.pipe";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SongArtistsPipe,
        ErrorMessageComponent,
        MessageComponent,
        ShowcaseItemComponent
    ],
    exports: [
        SongArtistsPipe,
        ErrorMessageComponent,
        MessageComponent,
        ShowcaseItemComponent
    ]
})
export class AppCommonModule {}