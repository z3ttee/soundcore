import { HttpErrorResponse } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";
import { ApiResponse } from "../../responses/api-response";

export function apiResponse() {
    return function<T>(source: Observable<T>) {
        return source.pipe(
            catchError((err: HttpErrorResponse) => {
                return of(err)
            }),
            map((result: T | HttpErrorResponse) => {
                if(result instanceof HttpErrorResponse) {
                    return new ApiResponse<T>(null, result);
                }

                return new ApiResponse<T>(result);
            })
        );
    }
}