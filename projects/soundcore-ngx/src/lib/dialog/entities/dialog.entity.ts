import { ComponentRef, ViewRef } from "@angular/core";
import { DialogRef } from "./dialog-ref.entity";

export class Dialog<C = any, D = any, R = any> {

    private _componentRef: ComponentRef<C>;

    constructor(
        public readonly ref: DialogRef<C, D, R>
    ) {
        this.ref.$afterClosed.subscribe(() => {
            this._componentRef.destroy();
        })
    }

    public get componentRef(): ComponentRef<C> {
        return this._componentRef;
    }

    public get viewRef(): ViewRef {
        return this._componentRef?.hostView;
    }

    public setComponentRef(ref: ComponentRef<C>) {
        this._componentRef = ref;
    }

    public get instantiated(): boolean {
        return !!this._componentRef?.hostView;
    }

}