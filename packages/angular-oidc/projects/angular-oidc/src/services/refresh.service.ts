import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class RefreshSessionService {
    private readonly _onSessionExpired = new Subject<void>();
    public readonly $onSessionExpired = this._onSessionExpired.asObservable();

    private _timeout: any | null = null;

    public setupSessionTimeout(expires_at: Date) {
        const expires_in = (expires_at.getTime() - Date.now()) / 1000;
        const expires_in_offset = expires_in - 30;

        // We expire tokens 30s before actual expiration to give the server time to process the request
        if (expires_in_offset <= 0) {
            this._expireSession();
            return;
        }

        setTimeout(() => {
            this._expireSession();
        }, expires_in_offset * 1000);
    }

    private _expireSession() {
        this._onSessionExpired.next();
        this._clearSessionTimeout();
    }

    private _clearSessionTimeout() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }
}
