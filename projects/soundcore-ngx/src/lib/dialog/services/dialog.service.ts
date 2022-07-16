import { ComponentType } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { DialogConfirmComponent } from "../components/dialog-confirm/dialog-confirm.component";
import { DialogConfig } from "../entities/dialog-config.entity";
import { DialogRef } from "../entities/dialog-ref.entity";
import { Dialog } from "../entities/dialog.entity";

@Injectable({
    providedIn: "root"
})
export class SCNGXDialogService {

    private readonly _stack: BehaviorSubject<Dialog[]> = new BehaviorSubject([]);

    public $dialogs: Observable<Dialog[]> = this._stack.asObservable();
    public $current: Observable<Dialog> = this.$dialogs.pipe(map((list) => list[list.length - 1]));

    constructor() {}

    public open<C, D, R>(component: ComponentType<C>, config?: DialogConfig<D>): DialogRef<D, R> {      
        // Push the new dialog to the stack
        // and push the update.
        const dialog = new Dialog(component, config);

        // Add event listener to the close event to automatically
        // remove the dialogRef from stack.
        dialog.ref.$afterClosed.subscribe(() => {
            // Remove from stack
            this._removeById(dialog.ref.id);
        })

        const stack = this._stack.getValue();
        stack.push(dialog);
        this._stack.next(stack);

        // Return ref only
        // API consumer should not have access to viewRefs etc.
        return dialog.ref;
    }

    /**
     * Open the built-in confirm dialog.
     * @param message Message to be displayed
     * @param title Title to be displayed
     * @returns 
     */
    public confirm(message?: string, title?: string) {
        return this.open<any, any, boolean>(DialogConfirmComponent, {
            data: null,
            title,
            message,
        });
    }

    public closeIndex(index: number, result?: any) {
        const dialogRef = this._stack[index];
        if(typeof dialogRef == "undefined" || dialogRef == null) return;

        dialogRef.close(result);
    }

    public closeAll() {
        // TODO
    }

    public closeTop<R>(result?: R) {
        const stack = this._stack.getValue();
        const top = stack[stack.length - 1];

        if(typeof top == "undefined" || top == null) return;
        top.ref.close(result);
    }


    /**
     * Remove a dialog from the stack by its id.
     * This does not close the dialog.
     * @param id Id of the dialog
     * @returns DialogRef<C, D ,R>
     */
    private _removeById<C, D ,R>(id: string) {
        const dialog = this._stack.getValue().find((dialog: Dialog) => dialog.ref.id === id);
        if(typeof dialog == "undefined" || dialog == null) {
            return;
        }

        this._stack.next(this._stack.getValue().filter((d) => d?.ref.id !== dialog?.ref?.id));
    }

}