import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import { DialogRef } from "@soundcore/ngx";
import { Playlist, ApiResponse, PlaylistPrivacy, SCSDKPlaylistService } from "@soundcore/sdk";

@Component({
    templateUrl: "./playlist-create-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
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

    public $loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public $error: BehaviorSubject<string> = new BehaviorSubject(null);

    constructor(
        public readonly dialogRef: DialogRef<any, Playlist>,
        private readonly playlistService: SCSDKPlaylistService
    ) {}

    public async submit() {
        if(this.$loading.getValue()) return;
        this.form.markAllAsTouched();
        if(this.form.invalid) return;

        this.$loading.next(true);
        this.$error.next(null);

        this.playlistService.createPlaylist({
            name: this.form.get("title").value,
            description: this.form.get("description").value,
            privacy: this.form.get("privacy").value
        }).pipe(takeUntil(this._destroy)).subscribe((request) => {
            this.$loading.next(request.loading);
            
            if(request.loading) return;
            if(request.error) {
                this.$error.next(request.error.message);
                return;
            }

            this.dialogRef.close(request.data);
        })
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}