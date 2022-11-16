import { Component, OnDestroy } from "@angular/core";
import { SCNGXDialogService } from "@soundcore/ngx";
import { Subject, takeUntil } from "rxjs";
import { AppImportSpotifyCreateDialog } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.component";

@Component({
    templateUrl: "./spotify-import.component.html"
})
export class SpotifyImportView implements OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    /**
     * Used to validate spotify urls.
     */
    private readonly spotifyBaseUrls: string[] = [
        "https://open.spotify.com/playlist/"
    ];

    constructor(
        private readonly dialog: SCNGXDialogService
    ) {}

    public openCreateImportDialog() {
        this.dialog.open(AppImportSpotifyCreateDialog).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((data) => {
            console.log(data);
        });
    }

    // https://open.spotify.com/playlist/16p4C5ULmMTeSTKXPlAAAT?si=2245a7ed665f4c60

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }
}