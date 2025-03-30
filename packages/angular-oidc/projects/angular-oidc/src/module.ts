import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { inject, makeEnvironmentProviders, provideAppInitializer } from "@angular/core";
import { DI_AUTH_OPTIONS } from "./constants";
import { accessTokenInterceptor } from "./interceptors/accesstoken.interceptor";
import { AuthenticationService } from "./services/authentication.service";
import { CookieService } from "./services/cookie.service";
import { AuthenticationModuleOptions } from "./types";

/** Register authentication module in an angular app */
export function provideAuthentication(options: AuthenticationModuleOptions) {
    return makeEnvironmentProviders([
        {
            provide: DI_AUTH_OPTIONS,
            useValue: options
        },
        CookieService,
        AuthenticationService,
        provideHttpClient(
            withInterceptors([accessTokenInterceptor()])
        ),
        provideAppInitializer(() => {
            const service = inject(AuthenticationService);

            return service.loadMetadata().then(() => {
                return service.tryAuthenticate(window.location.href)
            });
        })
    ])
}
