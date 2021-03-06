import { ComponentType } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { AscConfirmDialogComponent, ConfirmDialogOptions } from "../components/dialogs/confirm-dialog/confirm-dialog.component";
import { AscPlaylistEditorOptions } from "../components/dialogs/playlist-editor-dialog/dto/playlist-editor-options.dto";
import { AscPlaylistEditorDialogComponent } from "../components/dialogs/playlist-editor-dialog/playlist-editor-dialog.component";

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

    public async confirm(options?: ConfirmDialogOptions) {
        return this.openSync<AscConfirmDialogComponent, ConfirmDialogOptions, boolean>(AscConfirmDialogComponent, {
            data: options
        })
    }

    public openSync<T, ContextDataType, D>(component: ComponentType<T>, config?: MatDialogConfig<ContextDataType>) {
        return this.dialog.open<T, ContextDataType, D>(component, { 
            panelClass: ["bg-transparent"],
            ...config
        })
    }

    public openPlaylistEditorDialog(options: AscPlaylistEditorOptions = new AscPlaylistEditorOptions()) {
        return this.open(AscPlaylistEditorDialogComponent, {
          data: options
        })
      }

}