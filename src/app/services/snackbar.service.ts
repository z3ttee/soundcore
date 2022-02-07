import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: "root"
})
export class SnackbarService {

    constructor(
        private snackbar: MatSnackBar,
    ) {}

    public async info(text: string, config?: MatSnackBarConfig<any>): Promise<MatSnackBarRef<TextOnlySnackBar>> {
        return this.snackbar.open(text, null, { 
            duration: 4000,
            ...config
        })
    }

    public async open(text: string, action?: string, config?: MatSnackBarConfig<any>): Promise<MatSnackBarRef<TextOnlySnackBar>> {
        return this.snackbar.open(text, action, { 
            duration: 4000,
            ...config
        })
    }

}