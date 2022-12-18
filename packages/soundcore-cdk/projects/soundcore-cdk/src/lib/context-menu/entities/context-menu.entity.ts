import { Observable, Subject } from "rxjs";

export class SCNGXContextRef {

    constructor(
        private readonly _onCloseSubject: Subject<void> = new Subject()
    ) {}

    public readonly $onClosed: Observable<void> = this._onCloseSubject.asObservable();

}