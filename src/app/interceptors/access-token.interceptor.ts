import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthenticationService } from "../services/authentication.service";

@Injectable({
    providedIn: "root"
})
export class AccessTokenInterceptor implements HttpInterceptor {

    constructor(private authService: AuthenticationService){}

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getAccessToken();

        if(token) {
            req = req.clone({
                setHeaders: {
                    Authorization: token ? `Bearer ${token}` : undefined
                }
            });
        }

        return next.handle(req);
    }

}