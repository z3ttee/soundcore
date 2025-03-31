import { ComponentType } from "@angular/cdk/portal";
import { ComponentRef, ViewRef } from "@angular/core";
import { DialogConfig } from "./dialog-config.entity";
import { DialogRef } from "./dialog-ref.entity";

export class Dialog<C = any, D = any, R = any> {

    private _componentRef: ComponentRef<C>;
    public readonly ref: DialogRef<D, R>;

    constructor(
        public readonly component: ComponentType<C>,
        public readonly config?: DialogConfig<D>,
    ) {
        this.ref = new DialogRef<D, R>(this.config);
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