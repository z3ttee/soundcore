import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { ShowcaseItemComponent } from "./components/items/showcase-item/showcase-item.component";
import { SongArtistsPipe } from "./pipes/song-artists.pipe";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SongArtistsPipe,
        ErrorMessageComponent,
        ShowcaseItemComponent
    ],
    exports: [
        SongArtistsPipe,
        ErrorMessageComponent,
        ShowcaseItemComponent
    ]
})
export class AppCommonModule {}