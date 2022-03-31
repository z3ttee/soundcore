import { BehaviorSubject, Observable } from "rxjs";

export class SCLoadingState {
    constructor(private readonly defaultValue: boolean = false) {}

    private readonly _stateSubject: BehaviorSubject<boolean> = new BehaviorSubject(this.defaultValue || false);
    private readonly _errorSubject: BehaviorSubject<Error> = new BehaviorSubject(null);

    public $state: Observable<boolean> = this._stateSubject.asObservable();
    public $error: Observable<Error> = this._errorSubject.asObservable();

    public set(state: boolean) {
        this._stateSubject.next(state);
    }

    public setError(error: Error) {
        this._errorSubject.next(error);
    }

}