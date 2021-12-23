import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { SongArtistsPipe } from "./pipes/song-artists.pipe";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SongArtistsPipe,
        ErrorMessageComponent
    ],
    exports: [
        SongArtistsPipe,
        ErrorMessageComponent
    ]
})
export class AppCommonModule {}