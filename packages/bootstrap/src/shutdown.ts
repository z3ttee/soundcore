import { Injectable } from "@nestjs/common";
import { BehaviorSubject, filter, Observable, Subject } from "rxjs";

@Injectable()
export class BootstrapShutdownService {

    private readonly _shutdownSubject: BehaviorSubject<Error> = new BehaviorSubject(null);
    public readonly $shutdownListener: Observable<Error> = this._shutdownSubject.asObservable().pipe(filter((error) => !!error));

    constructor() {
        console.log("constructed bootstrap shutdown service")
    }

    public shutdown(error?: Error) {
        this._shutdownSubject.next(error ?? new Error(`Shutdown signal triggered by application internals.`));
        this._shutdownSubject.complete();
    }

}