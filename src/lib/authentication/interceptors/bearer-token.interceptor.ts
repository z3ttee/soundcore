import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, map, mergeMap, Observable, tap } from "rxjs";
import { AllianceAuthService } from "../authentication.service";

@Injectable()
export class AllianceBearerTokenInterceptor implements HttpInterceptor {

    constructor(private authService: AllianceAuthService) {}

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(this.authService.options.interceptor?.disabled) {
            return next.handle(req);
        }

        return this.handleWithToken(req, next);
    }

    private handleWithToken(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return from(this.authService.getToken()).pipe(
            map((token) => {
                if(!token) return req.headers;
                return req.headers.set("Authorization", `Bearer ${token}`);
            }),
            mergeMap((headers) => {
                const bearerRequest = req.clone({ headers });
                return next.handle(bearerRequest);
            })
        )
    }

}