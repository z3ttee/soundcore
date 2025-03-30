import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, mergeMap, Observable, tap, throwError } from "rxjs";
import { AuthenticationService } from "../services/authentication.service";

export function provideAccessTokenInterceptor(): HttpInterceptorFn {
    const service = inject(AuthenticationService);

    return (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        return service.$session.pipe(
            mergeMap((session) => {

                if (session && session.access_token) {
                    request = request.clone({
                        headers: request.headers.set('Authorization', `Bearer ${session.access_token}`)
                    });
                }

                return next(request).pipe(
                    catchError((error: any) => {
                        if (error && error.status) {
                            if (error.status == 401) {
                                this.router.navigate(['/']);
                            }
                        } else {
                            return throwError(() => error);
                        }
                    })
                )
            })
        )
    }
}