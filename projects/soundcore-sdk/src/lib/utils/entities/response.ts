import { HttpErrorResponse } from "@angular/common/http";
import { ApiError } from "../error/api-error";

export class Response<T> {

    constructor(
        public readonly payload: T,
        private readonly _error?: HttpErrorResponse
    ) { }

    public get error() {
        if(typeof this._error == "undefined" || this._error == null) return null;
        return new ApiError(
            this._error?.status,
            this._error?.error?.["message"],
            this._error?.error?.["error"]
        );
    }

    public get message() {
        return this.error.message;
    }

    public get status() {
        return this._error?.status || 200;
    }

}