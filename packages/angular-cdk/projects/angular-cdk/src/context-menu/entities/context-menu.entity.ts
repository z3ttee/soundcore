import { Observable, Subject } from "rxjs";

export class SCNGXContextRef {

    public readonly $onClosed: Observable<void>;

    constructor(
        private readonly _onCloseSubject: Subject<void> = new Subject()
    ) {
        this.$onClosed = this._onCloseSubject.asObservable();
    }
}