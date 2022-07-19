import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { DialogRef } from "soundcore-ngx";
import { Playlist, SCDKPlaylistService } from "soundcore-sdk";

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
        private readonly playlistService: SCDKPlaylistService,
    ) {}

    public $playlists = this.playlistService.$playlists;

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public choosePlaylist(playlist: Playlist) {
        this.dialogRef.close(playlist);
    }

}