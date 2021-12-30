import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AllianceError } from "src/app/model/error.model";
import { StorageMount } from "../model/storage-mount.model";
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
        @Inject(MAT_DIALOG_DATA) public data: StorageMount
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
            this.dialogRef.close();
        }).catch((error: HttpErrorResponse) => {
            this.error = error
        }).finally(() => {
            this.isLoading = false;
        })

    }

    public async cancel() {
        this.data = {} as StorageMount;
        this.isLoading = false;
        this.dialogRef.close();
    }

}