import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { DialogRef } from "@soundcore/ngx";
import { Playlist, ApiResponse, PlaylistPrivacy, SCSDKPlaylistService, SCSDKImportService, ImportTask } from "@soundcore/sdk";

@Component({
    templateUrl: "./import-spotify-create-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.Default
})
export class AppImportSpotifyCreateDialog implements OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public readonly form: FormGroup = new FormGroup({
        url: new FormControl<string>("", {
            validators: [
                Validators.required,
                Validators.minLength(3),
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
        public readonly dialogRef: DialogRef<any, ImportTask>,
        private readonly importService: SCSDKImportService
    ) {}

    public async submit() {
        if(this.loading) return;
        this.form.markAllAsTouched();
        if(this.form.invalid) return;

        this.loading = true;

        this.importService.create({
            url: this.form.get("url").value,
            privacy: this.form.get("privacy").value
        }).subscribe((response) => {
            this.loading = false;

            // Check for error
            if(response.error) {
                this.errorMessage = response.message;
                return;
            }

            // Dismiss dialog with response result
            this.dialogRef.close(response.payload);
        });
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}