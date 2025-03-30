import { APP_INITIALIZER, makeEnvironmentProviders } from "@angular/core";
import { AuthenticationModuleOptions } from "./types";
import { CookieService } from "./services/cookie.service";
import { AuthenticationService } from "./services/authentication.service";
import { DI_AUTH_OPTIONS } from "./constants";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { accessTokenInterceptor } from "./interceptors/accesstoken.interceptor";

/** Register authentication module in an angular app */
export function provideAuthentication(options: AuthenticationModuleOptions) {
    return makeEnvironmentProviders([
        {
            provide: DI_AUTH_OPTIONS,
            useValue: options
        },
        CookieService,
        AuthenticationService,
        {
            provide: APP_INITIALIZER,
            deps: [AuthenticationService],
            useFactory: async (service: AuthenticationService) => {
                return service.loadMetadata().then(() => {
                    return service.tryAuthenticate(window.location.href)
                });
            }
        },
        provideHttpClient(
            withInterceptors([accessTokenInterceptor()])
        )
    ])
}
