import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { DialogRef, SCNGXDialogService } from "soundcore-ngx";
import { Playlist, SCDKPlaylistService } from "soundcore-sdk";
import { AppPlaylistCreateDialog } from "../playlist-create-dialog/playlist-create-dialog.component";

@Component({
    templateUrl: "./playlist-choose-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.Default
})
export class AppPlaylistChooseDialog implements OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public loading: boolean = false;
    public errorMessage: string;

    constructor(
        public readonly dialogRef: DialogRef<any, Playlist>,
        private readonly dialog: SCNGXDialogService,
        private readonly playlistService: SCDKPlaylistService
    ) {}

    public $playlists = this.playlistService.$library.pipe(takeUntil(this._destroy));

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public choosePlaylist(playlist: Playlist) {
        this.dialogRef.close(playlist);
    }

    public openCreatePlaylistDialog() {
        this.dialog.open<any, any, Playlist>(AppPlaylistCreateDialog).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((playlist) => {
            if(typeof playlist === "undefined" || playlist == null) return;

            this.dialogRef.close(playlist);
        })
    }

}