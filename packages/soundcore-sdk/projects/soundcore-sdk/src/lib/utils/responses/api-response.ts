import { HttpErrorResponse } from "@angular/common/http";
import { ApiError } from "../error/api-error";

export class ApiResponse<T> {

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
        return this.error?.message;
    }

    public get status() {
        return this._error?.status || 200;
    }

    public static withPayload<T = null>(payload?: T): ApiResponse<T> {
        return new ApiResponse(payload, null);
    }

    public static withError<T = any>(error: Error | HttpErrorResponse): ApiResponse<T> {
        if(error instanceof HttpErrorResponse) {
            return new ApiResponse(null, error);
        } else {
            return new ApiResponse(null, new HttpErrorResponse({
                status: 400,
                statusText: "Client side error",
                error: error,
                url: "/"
            }))
        }
    }

}