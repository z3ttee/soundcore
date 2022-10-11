import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { DialogRef } from "soundcore-ngx";
import { Playlist, ApiResponse, PlaylistPrivacy, SCDKPlaylistService } from "soundcore-sdk";

@Component({
    templateUrl: "./playlist-create-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.Default
})
export class AppPlaylistCreateDialog implements OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public readonly form: FormGroup = new FormGroup({
        title: new FormControl<string>("", {
            validators: [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(120)
            ]
        }),
        description: new FormControl(null, {
            validators: [
                Validators.minLength(0),
                Validators.maxLength(254)
            ]
        }),
        privacy: new FormControl<PlaylistPrivacy>(PlaylistPrivacy.PUBLIC, {
            validators: [
                Validators.required
            ]
        })
    })

    public loading: boolean = false;
    public errorMessage: string;

    constructor(
        public readonly dialogRef: DialogRef<any, Playlist>,
        private readonly playlistService: SCDKPlaylistService
    ) {}

    public async submit() {
        if(this.loading) return;
        this.form.markAllAsTouched();
        if(this.form.invalid) return;

        this.loading = true;
        this.playlistService.createPlaylist({
            title: this.form.get("title").value,
            description: this.form.get("description").value,
            privacy: this.form.get("privacy").value
        }).pipe(takeUntil(this._destroy)).subscribe((result: ApiResponse<Playlist>) => {
            this.loading = false;

            if(result.error) {
                this.errorMessage = result.message;
                return;
            }

            this.dialogRef.close(result.payload);
        })
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}