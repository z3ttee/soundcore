import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { MessageComponent } from "./components/message/message.component";
import { SongArtistsPipe } from "./pipes/song-artists.pipe";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SongArtistsPipe,
        ErrorMessageComponent,
        MessageComponent
    ],
    exports: [
        SongArtistsPipe,
        ErrorMessageComponent,
        MessageComponent
    ]
})
export class AppCommonModule {}