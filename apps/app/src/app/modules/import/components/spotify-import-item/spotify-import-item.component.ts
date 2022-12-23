import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { ImportTask, Playlist } from "@soundcore/sdk";

@Component({
    selector: "app-spotify-import",
    templateUrl: "./spotify-import-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotifyImportItemComponent {

    @Input()
    public task: ImportTask<Playlist>

    @Input()
    public itemHeight: number = 56;

    @Output()
    public openReport: EventEmitter<void> = new EventEmitter();

}