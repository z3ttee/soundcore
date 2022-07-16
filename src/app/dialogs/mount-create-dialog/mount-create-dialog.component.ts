import { Component, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { DialogRef } from "soundcore-ngx";
import { ApiResponse, SCDKMountService, Mount, CreateResult } from "soundcore-sdk";

export interface MountCreateDialogOptions {
    bucketId: string;
}

@Component({
    templateUrl: "./mount-create-dialog.component.html"
})
export class AppMountCreateDialog implements OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public readonly form: FormGroup = new FormGroup({
        name: new FormControl<string>("", {
            validators: [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(32)
            ]
        }),
        directory: new FormControl(null, {
            validators: [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(4095)
            ]
        }),
        setAsDefault: new FormControl(false),
        doScan: new FormControl(true)
    })

    public loading: boolean = false;
    public errorMessage: string;

    constructor(
        public readonly dialogRef: DialogRef<MountCreateDialogOptions, Mount>,
        private readonly mountService: SCDKMountService,
    ) {}

    public async submit() {
        console.log("submitting")
        console.log(this.dialogRef.config.data)
        // return;

        if(this.loading) return;
        this.form.markAllAsTouched();
        if(this.form.invalid) return;

        this.loading = true;
        this.mountService.create({
            name: this.form.get("name").value,
            bucketId: this.dialogRef.config.data.bucketId,
            directory: this.form.get("directory").value,
            setAsDefault: this.form.get("setAsDefault").value,
            doScan: this.form.get("doScan").value
        }).pipe(takeUntil(this._destroy)).subscribe((response: ApiResponse<CreateResult<Mount>>) => {
            this.loading = false;

            if(response.error) {
                this.errorMessage = response.message;
                return;
            }

            this.dialogRef.close(response.payload.data);
        })
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}