import { ComponentType } from "@angular/cdk/overlay";
import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SCNGXDialogConfirmComponent } from "../dialogs/confirm/dialog-confirm.component";

@Injectable()
export class SCNGXDialogService {

    constructor(
        private readonly dialog: MatDialog
    ) {}

    public open<T, D, K>(component: ComponentType<T>, context?: D): MatDialogRef<T, K> {
        const dialogRef = this.dialog.open<T, D, K>(component, {
            data: context
        })
        return dialogRef;
    }

    public confirm(title: string, message: string): MatDialogRef<SCNGXDialogConfirmComponent, any> {
        return this.open(SCNGXDialogConfirmComponent);
    }

}