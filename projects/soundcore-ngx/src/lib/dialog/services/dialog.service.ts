import { ComponentType } from "@angular/cdk/portal";
import { ApplicationRef, Injectable, Injector } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SCNGXDialogComponent } from "../components/template/template.component";
import { DialogConfig } from "../entities/dialog-config.entity";
import { DialogRef } from "../entities/dialog-ref.entity";
import { Dialog } from "../entities/dialog.entity";

@Injectable()
export class SCNGXDialogService {

    private readonly _stack: BehaviorSubject<Dialog[]> = new BehaviorSubject([]);
    private readonly _current: BehaviorSubject<Dialog> = new BehaviorSubject(null);

    public $current: Observable<Dialog> = this._current.asObservable();
    public $dialogs: Observable<Dialog[]> = this._stack.asObservable();

    constructor(
        private readonly appRef: ApplicationRef,
        private readonly injector: Injector
    ) {
        // Update to stack updates to update
        // dialogs
        this._stack.subscribe(() => this._updateInternalStructure());
    }

    public open<C, D, R>(component: ComponentType<C>, config?: DialogConfig<D>): DialogRef<D, R> {
        const dialogRef = new DialogRef<D, R>(config);

        // Add event listener to the close event to automatically
        // remove the dialogRef from stack.
        dialogRef.$afterClosed.subscribe(() => {
            // Remove from stack
            this._removeById(dialogRef.id);
        })

        // Push the new dialog to the stack
        // and push the update.
        const dialog = new Dialog(dialogRef, component);
        const stack = this._stack.getValue();
        stack.push(dialog);
        this._stack.next(stack);

        // Return ref only
        // API consumer should not have access to viewRefs etc.
        return dialogRef;
    }

    public confirm() {
        this.open(SCNGXDialogComponent);
    }


    public closeIndex(index: number, result?: any) {
        const dialogRef = this._stack[index];
        if(typeof dialogRef == "undefined" || dialogRef == null) return;

        dialogRef.close(result);
    }

    public closeAll() {

    }

    public closeTop<R>(result?: R) {
        const current = this._current.getValue();
        if(typeof current == "undefined" || current == null) return;
        current.ref.close(result);
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
            console.warn("no dialog with id found: ", id);
            return;
        }

        console.log("removing dialog by id: ", id);
        this._stack.next(this._stack.getValue().filter((d) => d?.ref.id !== dialog?.ref?.id));
    }

    /**
     * Show the next dialog from stack.
     * This pops the next dialog from stack and places
     * it as the current dialog.
     * NOTE: If there is currently a dialog open, it does not get closed.
     */
    private _updateInternalStructure() {
        const stack = this._stack.getValue();
        const dialogRef = stack[0];
        console.log("setting current dialog to: ", dialogRef, stack);
        this._current.next(dialogRef);
    }

}