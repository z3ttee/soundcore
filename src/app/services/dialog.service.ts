import { ComponentType } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";

@Injectable({
    providedIn: "root"
})
export class DialogService {

    constructor(
        private dialog: MatDialog,
    ) {}

    public async open<T, ContextDataType>(component: ComponentType<T>, config?: MatDialogConfig<ContextDataType>): Promise<MatDialogRef<T, ContextDataType>> {
        return this.openSync(component, config)
    }

    public openSync<T, ContextDataType>(component: ComponentType<T>, config?: MatDialogConfig<ContextDataType>): MatDialogRef<T, ContextDataType> {
        return this.dialog.open<T, ContextDataType>(component, { 
            panelClass: ["bg-transparent"],
            ...config
        })
    }

}