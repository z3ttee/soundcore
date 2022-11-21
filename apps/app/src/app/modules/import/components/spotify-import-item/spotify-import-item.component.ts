import { Component, Input } from "@angular/core";
import { ImportTask, Playlist } from "@soundcore/sdk";

@Component({
    selector: "app-spotify-import",
    templateUrl: "./spotify-import-item.component.html"
})
export class SpotifyImportItemComponent {

    @Input()
    public task: ImportTask<Playlist>

}