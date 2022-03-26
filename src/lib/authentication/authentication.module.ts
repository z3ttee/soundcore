import { ModuleWithProviders, NgModule } from "@angular/core";
import Keycloak from "keycloak-js";
import { AllianceAuthService } from "./authentication.service";

@NgModule({
    providers: [
        AllianceAuthService
    ]
})
export class AllianceAuthModule {

    public static forRoot(options: Keycloak.KeycloakConfig): ModuleWithProviders<AllianceAuthModule> {
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
                }
            ]
        }
    }

}