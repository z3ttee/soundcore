import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Mount } from "../entities/mount.entity";
import { MountService } from "../services/mount.service";

@Component({
    templateUrl: './mount-editor.dialog.html',
})
export class MountEditorDialog {

    public isLoading: boolean = false;
    public error: HttpErrorResponse = undefined;

    constructor(
        private mountService: MountService,
        public dialogRef: MatDialogRef<MountEditorDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Mount
    ) {
        this.data["createIfNotExists"] = true
    }

    public async save() {
        this.isLoading = true;
        const isEditMode = this.data["isEditMode"]

        let promise;

        if(!isEditMode) {
            promise = this.mountService.create({ bucketId: this.data.bucket.id, path: this.data.path, name: this.data.name })
        } else {
            promise = this.mountService.update(this.data.id, { path: this.data.path, name: this.data.name })
        }

        promise.then((mount) => {
            this.data = mount;
            this.dialogRef.close(mount);
        }).catch((error: HttpErrorResponse) => {
            this.error = error
        }).finally(() => {
            this.isLoading = false;
        })

    }

    public async cancel() {
        this.data = {} as Mount;
        this.isLoading = false;
        this.dialogRef.close();
    }

}