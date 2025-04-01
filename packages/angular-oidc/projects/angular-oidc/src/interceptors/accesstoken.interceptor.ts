import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, mergeMap, Observable, of, throwError } from "rxjs";
import { AuthenticationService } from "../services/authentication.service";

export function accessTokenInterceptor(): HttpInterceptorFn {
    return (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const service = inject(AuthenticationService);

        return service.$session.pipe(
            mergeMap((session) => {
                if (session && session.access_token) {
                    request = request.clone({
                        headers: request.headers.set('Authorization', `Bearer ${session.access_token}`)
                    });
                }

                return next(request).pipe(
                    catchError((error: any): Observable<never> => {
                        if (error && error.status) {
                            if (error.status == 401) {
                                // TODO: handle 401 error
                            }
                        } else {
                            return throwError(() => error);
                        }

                        return of();
                    })
                )
            })
        )
    }
}