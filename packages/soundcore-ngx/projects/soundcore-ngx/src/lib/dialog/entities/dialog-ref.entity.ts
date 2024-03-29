import { Observable, Subject } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { DialogConfig } from "./dialog-config.entity";

export class DialogRef<D = any, R = any> {

    public readonly id: string = uuidv4();

    private readonly _afterClosedSubject: Subject<R> = new Subject();
    public readonly $afterClosed: Observable<R> = this._afterClosedSubject.asObservable();

    constructor(
        public readonly config?: DialogConfig<D>
    ){}

    public close(result?: R) {
        this._afterClosedSubject.next(result);
    }

}