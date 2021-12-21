import { NgModule } from "@angular/core";
import { SongArtistsPipe } from "./pipes/song-artists.pipe";

@NgModule({
    declarations: [
        SongArtistsPipe
    ],
    exports: [
        SongArtistsPipe
    ]
})
export class AppCommonModule {}