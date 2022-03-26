import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { AllianceAuthService } from "./authentication.service";
import { AllianceAuthConfig } from "./configs/auth-config";
import { AllianceBearerTokenInterceptor } from "./interceptors/bearer-token.interceptor";

@NgModule({
    providers: [
        AllianceAuthService
    ]
})
export class AllianceAuthModule {

    public static forRoot(options: AllianceAuthConfig): ModuleWithProviders<AllianceAuthModule> {
        return {
            ngModule: AllianceAuthModule,
            providers: [
                {
                    provide: "allianceAuthOptions",
                    useValue: options
                },
                {
                    provide: AllianceAuthService,
                    useValue: new AllianceAuthService(options)
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AllianceBearerTokenInterceptor,
                    multi: true
                }
            ]
        }
    }

}